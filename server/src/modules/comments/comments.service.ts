import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../database/schemas/comment.schema';
import { Task, TaskDocument } from '../../database/schemas/task.schema';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { SocketGateway } from '../../socket/socket.gateway';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    private readonly socketGateway: SocketGateway,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async assertWorkspaceMember(workspaceId: string, userId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');
    return workspace;
  }

  async create(userId: string, dto: CreateCommentDto, actorName = 'Someone'): Promise<CommentDocument> {
    const task = await this.taskModel.findById(dto.taskId);
    if (!task) throw new NotFoundException('Task not found');
    await this.assertWorkspaceMember(dto.workspaceId, userId);

    const comment = await this.commentModel.create({
      ...dto,
      authorId: userId,
    });

    // Broadcast to project room and task room
    const payload = comment.toObject();
    this.socketGateway.broadcastToProject(dto.projectId, 'comment:created', payload);
    this.socketGateway.broadcastToTask(dto.taskId, 'comment:created', payload);

    // Log activity
    this.activityService.log({
      actorId: userId,
      actorName,
      entityType: 'TASK',
      entityId: dto.taskId,
      projectId: dto.projectId,
      workspaceId: dto.workspaceId,
      action: 'COMMENTED',
      metadata: { commentId: (comment._id as unknown as string).toString() },
    }).catch(() => {/* ignore */});

    // Notify task assignees about new comment (exclude commenter)
    const notifyIds = (task.assigneeIds ?? []).filter((id) => id !== userId);
    if (notifyIds.length) {
      this.notificationsService.createMany(
        notifyIds.map((uid) => ({
          userId: uid,
          actorId: userId,
          actorName,
          type: 'COMMENT_CREATED' as const,
          title: 'New comment on task',
          body: `${actorName} commented on: ${task.title}`,
          entityId: dto.taskId,
          entityType: 'TASK',
        })),
      ).catch(() => {/* ignore */});
    }

    // Notify mentioned users
    if (dto.mentions?.length) {
      const mentionNotify = dto.mentions.filter((id) => id !== userId && !notifyIds.includes(id));
      if (mentionNotify.length) {
        this.notificationsService.createMany(
          mentionNotify.map((uid) => ({
            userId: uid,
            actorId: userId,
            actorName,
            type: 'MENTION' as const,
            title: 'You were mentioned',
            body: `${actorName} mentioned you in: ${task.title}`,
            entityId: dto.taskId,
            entityType: 'TASK',
          })),
        ).catch(() => {/* ignore */});
      }
    }

    return comment;
  }

  async findAllForTask(taskId: string, userId: string): Promise<CommentDocument[]> {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    await this.assertWorkspaceMember(task.workspaceId, userId);

    return this.commentModel
      .find({ taskId, isDeleted: false })
      .sort({ createdAt: 1 })
      .exec();
  }

  async update(
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentDocument> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can edit this comment');
    }

    comment.content = dto.content;
    comment.isEdited = true;
    const updated = await comment.save();

    this.socketGateway.broadcastToTask(comment.taskId, 'comment:updated', updated.toObject());

    return updated;
  }

  async delete(commentId: string, userId: string): Promise<{ message: string }> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    comment.isDeleted = true;
    await comment.save();

    this.socketGateway.broadcastToTask(comment.taskId, 'comment:deleted', {
      _id: commentId,
      taskId: comment.taskId,
    });

    return { message: 'Comment deleted' };
  }
}
