import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../../database/schemas/notification.schema';
import { SocketGateway } from '../../socket/socket.gateway';
import { MailService } from '../mail/mail.service';

export interface CreateNotificationDto {
  userId: string;
  actorId: string;
  actorName: string;
  type: NotificationType;
  title: string;
  body: string;
  entityId?: string;
  entityType?: string;
  /** Optional recipient email — triggers email delivery */
  recipientEmail?: string;
  /** Optional recipient name — used in email body */
  recipientName?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notifModel: Model<NotificationDocument>,
    private readonly socketGateway: SocketGateway,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    const notif = await this.notifModel.create(dto);

    // Real-time push to personal socket room
    this.socketGateway.broadcastToRoom(
      `user:${dto.userId}`,
      'notification:new',
      notif.toObject(),
    );

    // Fire-and-forget email (only if caller supplied an email address)
    this._sendEmailIfNeeded(dto);

    return notif;
  }

  /** Bulk-create notifications (e.g. for multiple assignees) */
  async createMany(dtos: CreateNotificationDto[]): Promise<void> {
    if (!dtos.length) return;
    const docs = await this.notifModel.insertMany(dtos);
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i] as NotificationDocument;
      this.socketGateway.broadcastToRoom(
        `user:${doc.userId}`,
        'notification:new',
        doc.toObject(),
      );
      // Email if provided in original DTO
      if (dtos[i]) this._sendEmailIfNeeded(dtos[i]);
    }
  }

  async findForUser(userId: string, limit = 30): Promise<NotificationDocument[]> {
    return this.notifModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async markRead(id: string, userId: string): Promise<NotificationDocument | null> {
    return this.notifModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true },
    );
  }

  async markAllRead(userId: string): Promise<{ modified: number }> {
    const result = await this.notifModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );
    return { modified: result.modifiedCount };
  }

  async unreadCount(userId: string): Promise<number> {
    return this.notifModel.countDocuments({ userId, isRead: false });
  }

  // ── Private helpers ──────────────────────────────────────────

  private _sendEmailIfNeeded(dto: CreateNotificationDto): void {
    if (!dto.recipientEmail) return;

    if (dto.type === 'TASK_ASSIGNED') {
      this.mailService.sendTaskAssigned({
        to:            dto.recipientEmail,
        recipientName: dto.recipientName ?? dto.userId,
        actorName:     dto.actorName,
        taskTitle:     dto.body,
      });
    } else if (dto.type === 'MENTION') {
      this.mailService.sendMentionNotification({
        to:            dto.recipientEmail,
        recipientName: dto.recipientName ?? dto.userId,
        actorName:     dto.actorName,
        taskTitle:     dto.body,
      });
    }
  }
}
