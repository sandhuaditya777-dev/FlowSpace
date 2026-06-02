import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'guest';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceMemberRole;
}

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        role: {
          type: String,
          enum: ['owner', 'admin', 'member', 'guest'],
          default: 'member',
        },
      },
    ],
    default: [],
  })
  members: WorkspaceMember[];
}

export const WorkspaceSchema: MongooseSchema = SchemaFactory.createForClass(Workspace);
