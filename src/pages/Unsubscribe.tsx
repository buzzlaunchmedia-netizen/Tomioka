import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { publicAction } from '@/lib/api';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';
export default function Unsubscribe() {
  const [params] = useSearchParams(); const token = params.get('token') || ''; usePageMeta('Unsubscribe', 'Manage your newsletter consent.');
  const mutation = useMutation({ mutationFn: () => publicAction('unsubscribe', { token }), onSuccess: () => toast.success('Unsubscribe request completed.'), onError: (error: Error) => toast.error(error.message) });
  return <main className="container-shell py-16"><section className="panel max-w-2xl"><p className="eyebrow">Your consent matters</p><h1 className="my-4 text-3xl font-semibold">Newsletter preferences.</h1><p className="mb-6 leading-7 text-muted">{mutation.isSuccess ? 'The subscription associated with this link is now inactive.' : token.length === 72 ? 'Confirm below to stop optional marketing updates. This does not affect order notifications.' : 'Open the unsubscribe link supplied when you subscribed, or contact store support.'}</p><button className="btn-primary" disabled={token.length!==72||mutation.isPending||mutation.isSuccess} onClick={()=>mutation.mutate()}>Unsubscribe</button></section></main>;
}
