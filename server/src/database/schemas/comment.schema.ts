import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  taskId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  content: string;

  // Optional: mentions (array of user subs)
  @Prop({ type: [String], default: [] })
  mentions: string[];

  @Prop({ type: Boolean, default: false })
  isEdited: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const CommentSchema: MongooseSchema = SchemaFactory.createForClass(Comment);
CommentSchema.index({ taskId: 1, createdAt: 1 });
