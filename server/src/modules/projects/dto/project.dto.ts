import {
  IsString, IsNotEmpty, MinLength, IsOptional,
  IsEnum, IsDateString, IsHexColor,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TaskStatusType } from '../../../database/schemas/workflow.schema';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'NO_PRIORITY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export class CreateProjectDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '64ab12ef...' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({ example: '64ab12ef...' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#6366f1' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ enum: ['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsEnum(['NO_PRIORITY', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: ProjectPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ enum: ['ACTIVE', 'ARCHIVED', 'ON_HOLD', 'COMPLETED'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'ARCHIVED', 'ON_HOLD', 'COMPLETED'])
  status?: ProjectStatus;
}

export class CreateProjectMemberDto {
  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'] })
  @IsEnum(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'])
  role: string;
}

export class UpdateProjectMemberDto {
  @ApiProperty({ enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'] })
  @IsEnum(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'])
  role: string;
}

export class CreateTaskStatusDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  workflowId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'] })
  @IsOptional()
  @IsEnum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'])
  type?: TaskStatusType;

  @ApiPropertyOptional()
  @IsOptional()
  position?: number;
}

export class UpdateTaskStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  position?: number;
}
