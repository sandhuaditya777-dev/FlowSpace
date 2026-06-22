import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';

export type WorkflowDocument = HydratedDocument<Workflow>;
export type TaskStatusDocument = HydratedDocument<TaskStatus>;

@Schema({ timestamps: true })
export class TaskStatus {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '#94a3b8' })
  color: string;

  @Prop({
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'],
    default: 'TODO',
  })
  type: TaskStatusType;

  @Prop({ default: 0 })
  position: number;

  @Prop({ required: true })
  workflowId: string;

  @Prop({ required: true })
  projectId: string;
}

export const TaskStatusSchema = SchemaFactory.createForClass(TaskStatus);

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);
