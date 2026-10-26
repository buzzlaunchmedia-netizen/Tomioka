import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAction } from '@/lib/api';
import { useAdminAuth } from '@/stores/AdminAuthProvider';
import { toast } from 'sonner';
export function useAdminMutation<T = unknown>(action: string, success = 'Saved to OnSpace Cloud.') {
  const { session } = useAdminAuth(); const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: T) => { if (!session) throw new Error('Sign in as administrator first.'); return adminAction(session.token, action, payload); },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ['store'] }); void client.invalidateQueries({ queryKey: ['catalogue-search'] }); toast.success(success); },
    onError: (error: Error) => toast.error(error.message),
  });
}
