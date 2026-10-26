import { useStore } from '@/stores/StoreProvider';
import ImageUploader from '@/components/forms/ImageUploader';
import { useQueryClient } from '@tanstack/react-query';
export default function MediaLibrary() {
  const { media } = useStore(); const client = useQueryClient();
  return <section><p className="eyebrow">Permanent OnSpace Cloud storage</p><h1 className="my-4 text-3xl font-semibold">Media library.</h1><p className="mb-6 leading-7 text-muted">Upload PNG, JPEG or WebP images under 5 MB. Uploaded files remain available when you close this browser. Referenced images are never automatically deleted.</p><ImageUploader onUploaded={() => void client.invalidateQueries({ queryKey: ['store'] })}/><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{media.map(m => <article key={m.id} className="panel min-w-0 p-3"><img src={m.url} alt={m.name} loading="lazy" className="aspect-square w-full rounded object-cover"/><p className="mt-3 truncate text-sm">{m.name}</p><a className="mt-2 flex min-h-11 items-center text-sm text-primary" href={m.url} target="_blank" rel="noopener noreferrer">Open image</a></article>)}</div>{!media.length && <p className="panel mt-8 text-muted">No files uploaded yet.</p>}</section>;
}
