import type { UseFormReturn } from 'react-hook-form';
import type { ProductValues } from '@/components/forms/ProductEditor';
import ImageUploader from '@/components/forms/ImageUploader';
import { useStore } from '@/stores/StoreProvider';
interface Props { form: UseFormReturn<ProductValues>; }
export default function ProductImages({ form }: Props) {
  const images = form.watch('images'); const { media } = useStore();
  const set = (urls: string[]) => form.setValue('images', urls, { shouldValidate: true, shouldDirty: true });
  const add = (url: string) => { if (images.length < 12 && !images.includes(url)) set([...images, url]); };
  const main = (index: number) => set([images[index], ...images.filter((_, i) => i !== index)]);
  return <section className="space-y-4"><h3 className="text-lg font-semibold">Product images</h3><ImageUploader onUploaded={add}/><div><label className="mb-2 block text-sm" htmlFor="reuse-image">Reuse a library image</label><select id="reuse-image" className="field" value="" onChange={e => add(e.target.value)}><option value="">Choose uploaded media</option>{media.map(m => <option key={m.id} value={m.url}>{m.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{images.map((url, i) => <div className="rounded-lg border border-line p-3" key={url}><img src={url} alt={`Product image ${i + 1}`} className="aspect-square w-full rounded object-cover"/><p className="mt-2 text-sm text-muted">{i === 0 ? 'Main image' : `Image ${i + 1}`}</p><button type="button" className="mt-2 min-h-11 text-sm text-primary" disabled={i === 0} onClick={() => main(i)}>Make main</button><button type="button" className="min-h-11 text-sm text-muted" onClick={() => set(images.filter((_, n) => n !== i))}>Remove from product</button></div>)}</div>{form.formState.errors.images && <p role="alert" className="text-sm text-danger">{form.formState.errors.images.message || 'Check image URLs.'}</p>}<p className="text-sm leading-7 text-muted">Main image is shown first. Removing an image here does not delete its stored file.</p></section>;
}
