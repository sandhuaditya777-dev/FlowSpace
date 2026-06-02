import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from '../../database/schemas/workspace.schema';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<WorkspaceDocument>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async create(userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceDocument> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.workspaceModel.findOne({ slug });
    if (existing) {
      // Append random suffix if slug conflicts
      const uniqueSlug = `${slug}-${Date.now().toString(36)}`;
      return this.workspaceModel.create({
        name: dto.name,
        slug: uniqueSlug,
        ownerId: userId,
        members: [{ userId, role: 'owner' }],
      });
    }

    return this.workspaceModel.create({
      name: dto.name,
      slug,
      ownerId: userId,
      members: [{ userId, role: 'owner' }],
    });
  }

  async findAllForUser(userId: string): Promise<WorkspaceDocument[]> {
    return this.workspaceModel
      .find({ 'members.userId': userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel.findById(id);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this workspace');

    return workspace;
  }

  async update(id: string, userId: string, dto: UpdateWorkspaceDto): Promise<WorkspaceDocument> {
    const workspace = await this.findById(id, userId);

    const member = workspace.members.find((m) => m.userId === userId);
    if (!member || !['owner', 'admin'].includes(member.role)) {
      throw new ForbiddenException('Only owners or admins can update the workspace');
    }

    Object.assign(workspace, dto);
    return workspace.save();
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const workspace = await this.findById(id, userId);

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the workspace owner can delete it');
    }

    await this.workspaceModel.findByIdAndDelete(id);
    return { message: 'Workspace deleted successfully' };
  }
}
