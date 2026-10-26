import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Mail } from 'lucide-react';
import { newsletterSchema } from '@/lib/validations';
import { publicAction } from '@/lib/api';
import { toast } from 'sonner';
type Values = z.infer<typeof newsletterSchema>;
export default function Newsletter() {
  const [token, setToken] = useState(''); const {register,handleSubmit,reset,formState:{errors}}=useForm<Values>({resolver:zodResolver(newsletterSchema)});
  const subscribe = useMutation({ mutationFn: (v: Values) => publicAction<{ ok: boolean; unsubscribeToken?: string }>('subscribe', v), onSuccess: result => { reset(); setToken(result.unsubscribeToken || ''); toast.success('Subscription saved to OnSpace Cloud. No email has been sent.'); }, onError: (error: Error) => toast.error(error.message) });
  return <section className="border-y border-line bg-surface"><div className="container-shell grid items-center gap-8 py-12 lg:grid-cols-2 lg:py-16"><div><p className="eyebrow mb-3 flex items-center gap-2"><Mail size={15}/> Stay in the loop</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Good things. First dibs.</h2><p className="mt-3 max-w-lg leading-relaxed text-muted">Get the heads-up on new drops, store updates, and more from your anime world.</p></div><form onSubmit={handleSubmit(v=>subscribe.mutate(v))} className="lg:pl-12"><label htmlFor="newsletter-email" className="mb-2 block text-sm">Your email address</label><div className="flex gap-2"><input id="newsletter-email" type="email" placeholder="you@example.com" className="field" {...register('email')}/><button className="btn-secondary shrink-0" disabled={subscribe.isPending} aria-label="Subscribe to newsletter"><ArrowRight size={20}/></button></div><label className="mt-4 flex min-h-11 items-start gap-3 text-sm text-muted"><input type="checkbox" className="mt-1 h-4 w-4 accent-current" {...register('consent')}/> I agree to receive optional store emails. Unsubscribe anytime.</label>{(errors.email||errors.consent)&&<p role="alert" className="mt-2 text-sm text-danger">{errors.email?.message||errors.consent?.message}</p>}<p className="mt-3 text-sm leading-7 text-muted">Saved securely in OnSpace Cloud. Email delivery is not configured yet.</p>{token&&<Link className="mt-3 flex min-h-11 items-center text-sm text-primary" to={`/unsubscribe?token=${encodeURIComponent(token)}`}>Save this unsubscribe link</Link>}</form></div></section>;
}
