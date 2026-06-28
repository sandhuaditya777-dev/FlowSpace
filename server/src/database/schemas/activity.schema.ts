import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

export type EntityType = 'TASK' | 'PROJECT' | 'WORKSPACE' | 'COMMENT';
export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'COMMENTED'
  | 'ARCHIVED';

@Schema({ timestamps: true })
export class Activity {
  @Prop({ required: true })
  actorId: string;

  @Prop({ required: true })
  actorName: string;

  @Prop({ required: true, enum: ['TASK', 'PROJECT', 'WORKSPACE', 'COMMENT'] })
  entityType: EntityType;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  projectId: string;

  @Prop({ required: true })
  workspaceId: string;

  @Prop({ required: true, enum: ['CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'ASSIGNED', 'UNASSIGNED', 'COMMENTED', 'ARCHIVED'] })
  action: ActivityAction;

  // e.g. { from: 'To Do', to: 'In Progress' }
  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const ActivitySchema: MongooseSchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ entityId: 1, createdAt: -1 });
ActivitySchema.index({ projectId: 1, createdAt: -1 });
