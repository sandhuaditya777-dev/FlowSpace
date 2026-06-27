import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument, ActivityAction, EntityType } from '../../database/schemas/activity.schema';
import { SocketGateway } from '../../socket/socket.gateway';

export interface LogActivityDto {
  actorId: string;
  actorName: string;
  entityType: EntityType;
  entityId: string;
  projectId: string;
  workspaceId: string;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async log(dto: LogActivityDto): Promise<ActivityDocument> {
    const entry = await this.activityModel.create({
      ...dto,
      metadata: dto.metadata ?? {},
    });

    // Broadcast to project room so all viewers get live feed updates
    this.socketGateway.broadcastToProject(dto.projectId, 'activity:created', entry.toObject());

    return entry;
  }

  async findForEntity(entityId: string, limit = 50): Promise<ActivityDocument[]> {
    return this.activityModel
      .find({ entityId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findForProject(projectId: string, limit = 100): Promise<ActivityDocument[]> {
    return this.activityModel
      .find({ projectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
