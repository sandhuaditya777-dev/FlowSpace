import { IsString, MinLength, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Corp', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Our team hub' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
  @ApiPropertyOptional()
  @IsOptional()
  settings?: Record<string, unknown>;
}

export class UpdateOrgMemberDto {
  @ApiProperty({ enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'] })
  @IsString()
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
}
