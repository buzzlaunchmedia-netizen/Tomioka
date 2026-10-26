import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productSchema } from '@/lib/validations';
import type { Product } from '@/types/store';
import { useAdminMutation } from '@/hooks/useAdminMutation';
import ProductImages from '@/components/forms/ProductImages';
import VariantFields from '@/components/forms/VariantFields';
interface Props { product: Product | null; onClose: () => void; }
export type ProductValues = z.infer<typeof productSchema>;
export default function ProductEditor({ product, onClose }: Props) {
  const mutation = useAdminMutation('save_product', 'Product saved to OnSpace Cloud.');
  const form = useForm<ProductValues>({ resolver: zodResolver(productSchema), defaultValues: product ? { ...product, category: product.category as ProductValues['category'], tags: product.tags.join(', '), keywords: product.keywords.join(', ') } : { name: '', description: '', category: 'Apparel', images: [], tags: '', keywords: '', sku: '', published: false, variants: [{ label: 'Default', price: 0, stock: 0 }] } });
  const variants = useFieldArray({ control: form.control, name: 'variants' });
  const { register, handleSubmit, formState: { errors } } = form;
  const submit = (v: ProductValues) => {
    const id = product?.id || crypto.randomUUID(); const slug = product?.slug || v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + id.slice(0, 8);
    const split = (s: string) => s.split(',').map(t => t.trim()).filter(Boolean);
    mutation.mutate({ ...v, id, slug, price: Math.min(...v.variants.map(x => x.price)), tags: split(v.tags), keywords: split(v.keywords) }, { onSuccess: onClose });
  };
  return <form className="panel mb-8 space-y-6" onSubmit={handleSubmit(submit)}><h2 className="text-xl font-semibold">{product ? 'Edit product' : 'Create product'}</h2><div className="grid gap-5 sm:grid-cols-2">{(['name','sku','tags','keywords'] as const).map(key => <div key={key}><label className="mb-2 block text-sm" htmlFor={`p-${key}`}>{({name:'Product name',sku:'SKU',tags:'Tags (comma separated)',keywords:'Search aliases (comma separated)'})[key]}</label><input id={`p-${key}`} className="field" {...register(key)}/>{errors[key] && <p className="mt-2 text-sm text-danger" role="alert">{errors[key]?.message}</p>}</div>)}<div><label htmlFor="p-category" className="mb-2 block text-sm">Category</label><select className="field" id="p-category" {...register('category')}><option>Apparel</option><option>Posters</option><option>Accessories</option></select></div><label className="flex min-h-12 items-center gap-3"><input type="checkbox" {...register('published')}/>Publish in the storefront</label><div className="sm:col-span-2"><label htmlFor="p-description" className="mb-2 block text-sm">Description</label><textarea id="p-description" rows={4} className="field" {...register('description')}/>{errors.description && <p className="mt-2 text-sm text-danger" role="alert">{errors.description.message}</p>}</div></div><ProductImages form={form}/><VariantFields form={form} variants={variants}/><div className="flex gap-3 border-t border-line pt-6"><button className="btn-primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save product'}</button><button className="btn-secondary" type="button" onClick={onClose}>Cancel</button></div></form>;
}
