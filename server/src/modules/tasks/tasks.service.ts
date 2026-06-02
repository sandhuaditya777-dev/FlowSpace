import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../../database/schemas/task.schema';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import { Project, ProjectDocument } from '../../database/schemas/project.schema';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
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

    return this.taskModel.create({
      ...dto,
      createdBy: userId,
      status: dto.status || project.statuses[0] || 'To Do',
    });
  }

  async findAllInProject(projectId: string, userId: string): Promise<TaskDocument[]> {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');
    await this.assertWorkspaceMember(project.workspaceId, userId);

    return this.taskModel
      .find({ projectId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.assertWorkspaceMember(task.workspaceId, userId);
    return task;
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.findById(id, userId);
    Object.assign(task, dto);
    return task.save();
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const task = await this.findById(id, userId);
    await this.taskModel.findByIdAndDelete(task._id);
    return { message: 'Task deleted successfully' };
  }
}
