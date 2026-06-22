import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../../database/schemas/task.schema';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import { Project, ProjectDocument } from '../../database/schemas/project.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { ProjectsService } from '../projects/projects.service';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private readonly projectsService: ProjectsService,
    private readonly socketGateway: SocketGateway,
  ) {}

  private async assertWorkspaceMember(workspaceId: string, userId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied to this workspace');
    return workspace;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    await this.assertWorkspaceMember(dto.workspaceId, userId);
    const project = await this.projectModel.findById(dto.projectId);
    if (!project) throw new NotFoundException('Project not found');

    const { number, identifier } = await this.projectsService.generateTaskNumber(dto.projectId);

    const taskData = {
      ...dto,
      taskNumber: number,
      slug: identifier,
      createdBy: userId,
      status: dto.status || project.statuses[0] || 'To Do',
      assigneeId: dto.assigneeIds?.[0] || dto.assigneeId || null,
      assigneeIds: dto.assigneeIds || (dto.assigneeId ? [dto.assigneeId] : []),
    };

    const task = await this.taskModel.create(taskData);
    this.socketGateway.broadcastToProject(dto.projectId, 'task:created', task.toObject());
    return task;
  }

  async findAllInProject(
    projectId: string,
    userId: string,
    filters?: {
      status?: string;
      priority?: string;
      type?: string;
      assigneeId?: string;
      parentTaskId?: string | null;
      isArchived?: boolean;
    },
  ): Promise<TaskDocument[]> {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    await this.assertWorkspaceMember(project.workspaceId, userId);

    const query: any = { projectId };

    if (filters) {
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.type) query.type = filters.type;
      if (filters.assigneeId) {
        query.$or = [
          { assigneeId: filters.assigneeId },
          { assigneeIds: filters.assigneeId }
        ];
      }
      if (filters.parentTaskId !== undefined) {
        query.parentTaskId = filters.parentTaskId;
      }
      if (filters.isArchived !== undefined) {
        query.isArchived = filters.isArchived;
      } else {
        query.isArchived = false;
      }
    } else {
      query.isArchived = false;
    }

    return this.taskModel
      .find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.assertWorkspaceMember(task.workspaceId, userId);
    return task;
  }

  async findSubtasks(parentTaskId: string, userId: string): Promise<TaskDocument[]> {
    const parentTask = await this.taskModel.findById(parentTaskId);
    if (!parentTask) throw new NotFoundException('Parent task not found');
    await this.assertWorkspaceMember(parentTask.workspaceId, userId);

    return this.taskModel
      .find({ parentTaskId, isArchived: false })
      .sort({ createdAt: 1 })
      .exec();
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.findById(id, userId);
    
    const updates: any = { ...dto, updatedBy: userId };
    if (dto.assigneeIds) {
      updates.assigneeId = dto.assigneeIds[0] || null;
    } else if (dto.assigneeId) {
      updates.assigneeIds = [dto.assigneeId];
    }

    Object.assign(task, updates);
    const saved = await task.save();
    this.socketGateway.broadcastToProject(saved.projectId, 'task:updated', saved.toObject());
    return saved;
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const task = await this.findById(id, userId);
    const projectId = task.projectId;
    const taskId = (task._id as unknown as string).toString();
    await this.taskModel.findByIdAndDelete(task._id);
    this.socketGateway.broadcastToProject(projectId, 'task:deleted', { _id: taskId, projectId });
    return { message: 'Task deleted successfully' };
  }
}

