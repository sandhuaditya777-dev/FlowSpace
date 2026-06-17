import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type OrgRole = 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export type OrganizationDocument = HydratedDocument<Organization>;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, minlength: 2 })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  settings: Record<string, unknown>;
}

export const OrganizationSchema: MongooseSchema = SchemaFactory.createForClass(Organization);
