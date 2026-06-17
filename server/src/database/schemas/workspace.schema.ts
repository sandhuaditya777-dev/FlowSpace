import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type WorkspaceMemberRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceMemberRole;
}

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ default: null })
  parentId: string | null;

  @Prop()
  description?: string;

  @Prop()
  logoUrl?: string;

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
  members: WorkspaceMember[];
}

export const WorkspaceSchema: MongooseSchema = SchemaFactory.createForClass(Workspace);

// Unique slug within an organization
WorkspaceSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
