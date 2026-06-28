import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../../database/schemas/task.schema';
import { Project, ProjectSchema } from '../../database/schemas/project.schema';
import { Comment, CommentSchema } from '../../database/schemas/comment.schema';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name,    schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
