import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockKeyhole, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAdminAuth } from '@/stores/AdminAuthProvider';
import BrandLogo from '@/components/layout/BrandLogo';
import { toast } from 'sonner';
const schema = z.object({ pin: z.string().regex(/^\d{6,12}$/, 'Enter your 6–12 digit admin PIN.') });
export default function AdminPinForm() {
  const { signIn } = useAdminAuth(); const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const login = useMutation({ mutationFn: ({ pin }: z.infer<typeof schema>) => signIn(pin), onError: (error: Error) => toast.error(error.message), onSuccess: () => toast.success('Administrator signed in.') });
  return <main className="container-shell grid gap-8 py-16 lg:grid-cols-[1.2fr_1fr]"><div><BrandLogo className="w-48"/><p className="eyebrow mt-10">Tomioka / Store control</p><h1 className="mt-4 text-4xl font-semibold">Your store. Protected.</h1><p className="mt-5 max-w-lg leading-7 text-muted">Manage real products, permanent media, published content and orders in OnSpace Cloud.</p><p className="mt-5 max-w-lg text-sm leading-7 text-muted">Server-verified PIN access. Five attempts per 15 minutes. Sessions expire after six hours.</p></div><form className="panel self-start space-y-6" onSubmit={handleSubmit(v => login.mutate(v))}><LockKeyhole className="text-primary"/><h2 className="text-2xl font-semibold">Administrator sign in</h2><div><label htmlFor="admin-pin" className="mb-2 block text-sm">Admin PIN</label><input id="admin-pin" type="password" inputMode="numeric" autoComplete="current-password" className="field" maxLength={12} {...register('pin')}/>{errors.pin && <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-danger"><AlertCircle size={16}/>{errors.pin.message}</p>}</div><button className="btn-primary w-full" disabled={login.isPending}>{login.isPending ? 'Verifying…' : 'Unlock administration'}</button><p className="text-sm leading-7 text-muted">No PIN is bundled in the storefront. Change the initial PIN in Security after signing in.</p></form></main>;
}
