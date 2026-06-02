import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  getHello(): string {
    return 'Welcome to Real-Time Collaboration Platform API!';
  }

  async getHealth() {
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    const readyState = this.connection.readyState;
    const dbStatus = dbStates[readyState as 0 | 1 | 2 | 3] || 'unknown';
    
    return {
      status: readyState === 1 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          connected: readyState === 1,
        },
        auth: {
          status: 'ok',
          provider: 'Auth0 (Dummy Mode Enabled)',
        },
      },
    };
  }
}
