import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { interactionService } from '@/services/interactionService';
import { queryKeys } from '@/services/queryKeys';
import type { ContentMetrics } from '@/types';

export function useContentMetrics(contentType: string, contentId: string) {
  return useQuery({
    queryKey: queryKeys.metrics(contentType, contentId),
    queryFn: () => interactionService.getMetrics(contentType, contentId),
    enabled: Boolean(contentId),
    staleTime: 60_000,
  });
}

export function useFavorite(contentType: string, contentId: string) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['favorite', contentType, contentId],
    queryFn: () => interactionService.isFavorite(contentType, contentId),
    enabled: isAuthenticated && Boolean(contentId),
  });

  const mutation = useMutation({
    mutationFn: () => interactionService.toggleFavorite(contentType, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', contentType, contentId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics(contentType, contentId) });
    },
  });

  return {
    isFavorite: statusQuery.data ?? false,
    isAuthenticated,
    toggle: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useContentMetricsPrefetcher(contentType: string, contentId: string) {
  return useContentMetrics(contentType, contentId);
}

export type { ContentMetrics };
