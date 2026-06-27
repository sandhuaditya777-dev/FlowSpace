import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search across tasks, projects, and comments' })
  @ApiQuery({ name: 'q',           description: 'Search query',  required: true })
  @ApiQuery({ name: 'workspaceId', description: 'Workspace ID',  required: true })
  @ApiQuery({ name: 'limit',       description: 'Results per category', required: false })
  async search(
    @Query('q')           q: string,
    @Query('workspaceId') workspaceId: string,
    @Query('limit')       limit: string,
    @User() _user: unknown,
  ) {
    return this.searchService.search(q, workspaceId, limit ? parseInt(limit, 10) : 5);
  }
}
