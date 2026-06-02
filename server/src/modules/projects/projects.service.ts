import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../../database/schemas/project.schema';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  private async assertWorkspaceMember(workspaceId: string, userId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace not found');
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this workspace');
    return workspace;
  }

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectDocument> {
    await this.assertWorkspaceMember(dto.workspaceId, userId);
    return this.projectModel.create({
      ...dto,
      memberIds: [userId],
    });
  }

  async findAllInWorkspace(workspaceId: string, userId: string): Promise<ProjectDocument[]> {
    await this.assertWorkspaceMember(workspaceId, userId);
    return this.projectModel
      .find({ workspaceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    await this.assertWorkspaceMember(project.workspaceId, userId);
    return project;
  }

  async update(id: string, userId: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const project = await this.findById(id, userId);
    Object.assign(project, dto);
    return project.save();
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const project = await this.findById(id, userId);
    await this.projectModel.findByIdAndDelete(project._id);
    return { message: 'Project deleted successfully' };
  }
}
