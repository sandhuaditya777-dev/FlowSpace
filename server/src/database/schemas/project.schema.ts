import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface ProjectMember {
  userId: string;
  role: ProjectMemberRole;
}

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  identifier: string; // e.g. "ENG" — used for task numbering (ENG-1, ENG-2)

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop()
  iconUrl?: string;

  @Prop({
    type: String,
    enum: ['ACTIVE', 'ARCHIVED', 'ON_HOLD', 'COMPLETED'],
    default: 'ACTIVE',
  })
  status: ProjectStatus;

  @Prop({
    type: String,
    enum: ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'NO_PRIORITY',
  })
  priority: ProjectPriority;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: 0 })
  taskSequence: number; // Atomically incremented for task identifiers

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  settings: Record<string, unknown>;

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        role: {
          type: String,
          enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
          default: 'MEMBER',
        },
      },
    ],
    default: [],
  })
  members: ProjectMember[];

  // Keep legacy statuses array for backward compat with existing task schema
  @Prop({ type: [String], default: [] })
  statuses: string[];
}

export const ProjectSchema: MongooseSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1, identifier: 1 }, { unique: true });
