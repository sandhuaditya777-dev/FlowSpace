import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  _id: string; // Stores Auth0 sub directly (e.g., "auth0|..." or "mock|...")

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ type: String, default: 'MEMBER' })
  role: string; // Global platform role (MEMBER, SUPER_ADMIN)

  @Prop({ type: String, default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE

  @Prop({ type: String, default: 'UTC' })
  timezone: string;

  @Prop({ type: String, default: 'en' })
  language: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String, default: {} })
  preferences: Map<string, string>;
}

export const UserSchema: MongooseSchema = SchemaFactory.createForClass(User);
