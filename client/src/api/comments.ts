import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import type { Comment } from './types';

// ── Queries ──────────────────────────────────────────────────────────────────

export function useComments(taskId: string | null) {
  return useQuery<Comment[]>({
    queryKey: ['comments', taskId],
    queryFn: () => api.get<Comment[]>(`/comments?taskId=${taskId}`),
    enabled: !!taskId,
    staleTime: 30_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

interface CreateCommentVars {
  taskId: string;
  projectId: string;
  workspaceId: string;
  content: string;
  mentions?: string[];
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, CreateCommentVars>({
    mutationFn: (vars) => api.post<Comment>('/comments', vars),
    onSuccess: (comment) => {
      queryClient.setQueryData<Comment[]>(['comments', comment.taskId], (old = []) => {
        if (old.some((c) => c._id === comment._id)) return old;
        return [...old, comment];
      });
    },
  });
}

interface UpdateCommentVars {
  id: string;
  taskId: string;
  content: string;
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, UpdateCommentVars>({
    mutationFn: ({ id, content }) => api.patch<Comment>(`/comments/${id}`, { content }),
    onSuccess: (comment) => {
      queryClient.setQueryData<Comment[]>(['comments', comment.taskId], (old = []) =>
        old.map((c) => (c._id === comment._id ? comment : c)),
      );
    },
  });
}

interface DeleteCommentVars {
  id: string;
  taskId: string;
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, DeleteCommentVars>({
    mutationFn: ({ id }) => api.delete(`/comments/${id}`),
    onSuccess: (_, { id, taskId }) => {
      queryClient.setQueryData<Comment[]>(['comments', taskId], (old = []) =>
        old.filter((c) => c._id !== id),
      );
    },
  });
}
