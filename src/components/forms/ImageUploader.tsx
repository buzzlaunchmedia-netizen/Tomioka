import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, AlertCircle } from 'lucide-react';
import { invoke } from '@/lib/api';
import { useAdminAuth } from '@/stores/AdminAuthProvider';
import { toast } from 'sonner';
interface Props { onUploaded: (url: string) => void; }
export default function ImageUploader({ onUploaded }: Props) {
  const { session } = useAdminAuth(); const input = useRef<HTMLInputElement>(null);
  const upload = useMutation({ mutationFn: async (file: File) => {
    if (!session) throw new Error('Sign in as administrator first.');
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 5242880 || !file.size) throw new Error('Choose a PNG, JPEG or WebP image under 5 MB.');
    const form = new FormData(); form.append('file', file);
    return invoke<{ url: string }>('store-admin', form, session.token);
  }, onSuccess: data => { onUploaded(data.url); toast.success('Image uploaded permanently to OnSpace Cloud.'); if (input.current) input.current.value = ''; }, onError: (error: Error) => toast.error(error.message) });
  return <div><label className="mb-2 block text-sm" htmlFor="media-upload">Upload image from your device</label><input id="media-upload" ref={input} type="file" accept="image/png,image/jpeg,image/webp" disabled={upload.isPending} className="field file:mr-4 file:rounded file:border-0 file:bg-elevated file:px-3 file:py-1 file:text-foreground" onChange={e => { const file = e.target.files?.[0]; if (file) upload.mutate(file); }}/><p role="status" className="mt-2 flex items-center gap-2 text-sm text-muted"><Upload size={16}/>{upload.isPending ? 'Uploading to permanent storage…' : 'PNG, JPEG or WebP · up to 5 MB'}</p>{upload.error && <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-danger"><AlertCircle size={16}/>{upload.error.message}</p>}</div>;
}
