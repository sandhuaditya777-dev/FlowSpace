import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement Auth Module' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'project-id-here' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'workspace-id-here' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiPropertyOptional({ example: 'Detailed description of the task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' })
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  @IsOptional()
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';

  @ApiPropertyOptional({ example: 'To Do' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'user-id-here' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: '2026-06-30' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: ['backend', 'auth'] })
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['Low', 'Medium', 'High', 'Critical'] })
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  @IsOptional()
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];
}
