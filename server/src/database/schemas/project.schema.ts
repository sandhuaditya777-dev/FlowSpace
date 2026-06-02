import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: [String],
    default: ['To Do', 'In Progress', 'In Review', 'Completed'],
  })
  statuses: string[];

  @Prop({ type: [String], default: [] })
  memberIds: string[];
}

export const ProjectSchema: MongooseSchema = SchemaFactory.createForClass(Project);
