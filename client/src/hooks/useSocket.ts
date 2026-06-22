'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

/**
 * Subscribe to a socket.io event. The listener is automatically cleaned up
 * when the component unmounts or when event/handler changes.
 */
export function useSocketEvent<T = unknown>(
  event: string,
  handler: (data: T) => void,
) {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, handler as (...args: unknown[]) => void);
    return () => {
      socket.off(event, handler as (...args: unknown[]) => void);
    };
  }, [event, handler]);
}
