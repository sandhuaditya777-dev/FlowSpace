import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'My Awesome Team' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({ example: 'my-awesome-team' })
  @IsString()
  @IsOptional()
  slug?: string;
}

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: 'New Workspace Name' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(60)
  name?: string;
}
