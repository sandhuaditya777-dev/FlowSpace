import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  })
  priority: TaskPriority;

  @Prop({ required: true, default: 'To Do' })
  status: string;

  @Prop({ default: null })
  assigneeId: string | null;

  @Prop({ default: null })
  dueDate: Date | null;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ required: true })
  createdBy: string;
}

export const TaskSchema: MongooseSchema = SchemaFactory.createForClass(Task);
