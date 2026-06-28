import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../../database/schemas/task.schema';

export interface ByStatus  { status: string;   count: number }
export interface ByPriority { priority: string; count: number }
export interface ByAssignee { assigneeId: string; count: number }
export interface DayPoint   { date: string; count: number }

export interface ProjectAnalytics {
  byStatus:            ByStatus[];
  byPriority:          ByPriority[];
  byAssignee:          ByAssignee[];
  completionTimeline:  DayPoint[];
  total:               number;
  completedCount:      number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    const [
      byStatus,
      byPriority,
      byAssignee,
      completionTimeline,
      total,
      completedCount,
    ] = await Promise.all([
      // Tasks by status
      this.taskModel.aggregate([
        { $match: { projectId, isArchived: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]),

      // Tasks by priority
      this.taskModel.aggregate([
        { $match: { projectId, isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $project: { _id: 0, priority: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]),

      // Tasks by assignee (top 8)
      this.taskModel.aggregate([
        { $match: { projectId, isArchived: false, assigneeId: { $ne: null } } },
        { $group: { _id: '$assigneeId', count: { $sum: 1 } } },
        { $project: { _id: 0, assigneeId: '$_id', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Completions over last 14 days
      this.taskModel.aggregate([
        {
          $match: {
            projectId,
            completedAt: {
              $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
              $ne: null,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, date: '$_id', count: 1 } },
        { $sort: { date: 1 } },
      ]),

      // Total tasks
      this.taskModel.countDocuments({ projectId, isArchived: false }),

      // Completed (completedAt set)
      this.taskModel.countDocuments({
        projectId,
        isArchived: false,
        completedAt: { $ne: null },
      }),
    ]);

    return {
      byStatus:           byStatus as ByStatus[],
      byPriority:         byPriority as ByPriority[],
      byAssignee:         byAssignee as ByAssignee[],
      completionTimeline: completionTimeline as DayPoint[],
      total,
      completedCount,
    };
  }
}
