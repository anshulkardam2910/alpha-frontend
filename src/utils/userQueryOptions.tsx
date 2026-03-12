import { userApi } from '@/services/user';
import { queryKeys } from '@/utils/constants';
import { queryOptions } from '@tanstack/react-query';

export const createCurrentUserQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.auth.currentUser,
    queryFn: userApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  