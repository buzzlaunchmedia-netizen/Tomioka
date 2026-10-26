import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminMutation } from '@/hooks/useAdminMutation';
const schema = z.object({ pin: z.string().regex(/^\d{6,12}$/, 'Use 6–12 digits.'), confirm: z.string() }).refine(v => v.pin === v.confirm, { message: 'PINs do not match.', path: ['confirm'] });
export default function AdminSecurity() {
  const mutation = useAdminMutation<{ pin: string }>('change_pin', 'PIN changed. Sign in again with the new PIN.');
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return <section><p className="eyebrow">Server-side access control</p><h1 className="my-4 text-3xl font-semibold">Administrator security.</h1><p className="mb-8 max-w-2xl leading-7 text-muted">Your initial PIN was shared in chat. Replace it before launch. Changing it expires every admin session. PIN access is one shared administrator identity, not individual staff accounts.</p><form className="panel max-w-xl space-y-5" onSubmit={handleSubmit(v => mutation.mutate({ pin: v.pin }, { onSuccess: () => window.dispatchEvent(new Event('store-admin-expired')) }))}>{(['pin', 'confirm'] as const).map(key => <div key={key}><label htmlFor={`security-${key}`} className="mb-2 block text-sm">{key === 'pin' ? 'New PIN' : 'Confirm new PIN'}</label><input id={`security-${key}`} type="password" inputMode="numeric" autoComplete="new-password" className="field" maxLength={12} {...register(key)}/>{errors[key] && <p role="alert" className="mt-2 text-sm text-danger">{errors[key]?.message}</p>}</div>)}<button className="btn-primary" disabled={mutation.isPending}>Change PIN and expire sessions</button></form></section>;
}
