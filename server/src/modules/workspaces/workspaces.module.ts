import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from '../../database/schemas/workspace.schema';
import {
  OrganizationMember,
  OrganizationMemberSchema,
} from '../../database/schemas/organization-member.schema';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
    ]),
  ],
  providers: [WorkspacesService],
  controllers: [WorkspacesController],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
