import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../../database/schemas/task.schema';
import { Project, ProjectDocument } from '../../database/schemas/project.schema';
import { Comment, CommentDocument } from '../../database/schemas/comment.schema';

export interface SearchResult {
  tasks: TaskDocument[];
  projects: ProjectDocument[];
  comments: CommentDocument[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Task.name)    private taskModel:    Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async search(
    query: string,
    workspaceId: string,
    limit = 5,
  ): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
      return { tasks: [], projects: [], comments: [] };
    }

    const q = query.trim();

    // Run all three $text searches in parallel
    const [tasks, projects, comments] = await Promise.all([
      this.taskModel
        .find({
          workspaceId,
          isArchived: false,
          $text: { $search: q },
        })
        .select('_id title slug status priority projectId workspaceId type')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .exec(),

      this.projectModel
        .find({
          workspaceId,
          isArchived: false,
          $text: { $search: q },
        })
        .select('_id name slug description color identifier')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .exec(),

      this.commentModel
        .find({
          workspaceId,
          isDeleted: false,
          $text: { $search: q },
        })
        .select('_id content taskId projectId authorId createdAt')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .exec(),
    ]);

    return { tasks, projects, comments };
  }
}
