import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { OrgRole } from './organization.schema';

export type OrganizationMemberDocument = HydratedDocument<OrganizationMember>;

@Schema({ timestamps: true })
export class OrganizationMember {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({
    type: String,
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
    default: 'MEMBER',
  })
  role: OrgRole;
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(OrganizationMember);

// Compound unique index: one membership per user per org
OrganizationMemberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
