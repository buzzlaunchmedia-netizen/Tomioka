import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { LockKeyhole, ArrowRight, CheckCircle2 } from 'lucide-react';
import { checkoutSchema } from '@/lib/validations';
import { useStore } from '@/stores/StoreProvider';
import { publicAction } from '@/lib/api';
import { itemPrice, itemStock } from '@/lib/cloudData';
import { STATES, money } from '@/constants/store';
import { usePageMeta } from '@/hooks/usePageMeta';
import CheckoutFields from '@/components/forms/CheckoutFields';
import { toast } from 'sonner';
type Values=z.infer<typeof checkoutSchema>;
interface Receipt { reference: string; total: number; }
export default function Checkout() {
  const {data,setData,loading}=useStore(); const [receipt,setReceipt]=useState<Receipt>(); const key=useRef(crypto.randomUUID()); const form=useForm<Values>({resolver:zodResolver(checkoutSchema)}); usePageMeta('Guest checkout','Submit an unpaid order request for Nigerian delivery. Paystack is not connected.');
  const rows=data.cart.map(c=>({c,p:data.products.find(p=>p.id===c.productId)})); const subtotal=rows.reduce((s,{c,p})=>s+itemPrice(p,c.size)*c.quantity,0); const delivery=data.settings.deliveryFee;
  const order=useMutation({mutationFn:(customer:Values)=>{
    if(!rows.length||rows.some(({c,p})=>!p?.published||itemStock(p,c.size)<c.quantity))throw new Error('An item has changed. Please review your bag.');
    return publicAction<Receipt>('order',{customer,items:data.cart,key:key.current});
  },onSuccess:result=>{setReceipt(result);setData(s=>({...s,cart:[]}));toast.success('Unpaid order request saved to OnSpace Cloud. No payment taken.');},onError:(error:Error)=>toast.error(error.message)});
  if(receipt)return <main className="container-shell py-20"><div className="panel mx-auto max-w-2xl text-center"><CheckCircle2 size={40} className="mx-auto text-primary"/><h1 className="mt-6 text-3xl font-semibold">Your order request is saved.</h1><p className="mt-4 leading-7 text-muted">Payment is pending. No money was collected, stock is not reserved, and fulfilment has not started. Keep your reference and checkout email for secure tracking.</p><p className="my-6 break-all font-display text-xl text-primary">{receipt.reference}</p><p className="mb-6">Server-confirmed total: {money(Number(receipt.total))}</p><Link to="/track" className="btn-primary">Track order request <ArrowRight size={18}/></Link></div></main>;
  if(loading)return <main className="container-shell py-20" role="status">Loading your shopping bag…</main>;
  if(!rows.length)return <main className="container-shell py-20"><h1 className="text-3xl">Your bag is empty.</h1><Link className="btn-primary mt-6" to="/shop">Explore the store</Link></main>;
  return <main className="container-shell py-12"><p className="eyebrow">No account required</p><h1 className="mt-3 text-4xl font-semibold">Make it yours.</h1><div className="my-7 flex gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-7"><LockKeyhole className="shrink-0 text-primary" size={20}/><p><strong>Unpaid order requests only.</strong> Details save privately in OnSpace Cloud. Paystack is not connected; no payment is collected and no stock is reserved.</p></div><form onSubmit={form.handleSubmit(v=>order.mutate(v))} className="grid gap-10 lg:grid-cols-[1.5fr_1fr]"><CheckoutFields form={form} states={STATES}/><aside className="panel self-start"><h2 className="mb-6 text-xl font-semibold">Order summary</h2>{rows.map(({c,p})=><div className="flex justify-between gap-4 border-b border-line py-3 text-sm" key={`${c.productId}-${c.size}`}><span>{p?.name||'Unavailable item'} × {c.quantity}<span className="mt-1 block text-sm text-muted">{c.size}</span></span><span>{money(itemPrice(p,c.size)*c.quantity)}</span></div>)}<div className="mt-5 space-y-4 text-sm"><p className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></p><p className="flex justify-between"><span className="text-muted">Delivery</span><span>{delivery?money(delivery):'Not configured'}</span></p><p className="flex justify-between border-t border-line pt-5 text-lg font-semibold"><span>Estimated total</span><span className="text-primary">{money(subtotal+delivery)}</span></p></div><button disabled={order.isPending||!delivery} className="btn-primary mt-6 w-full">{order.isPending?'Saving to Cloud…':'Create unpaid order request'} <ArrowRight size={17}/></button><p className="mt-4 text-sm leading-7 text-muted">{delivery?'Prices, option stock and delivery are validated on the server. Marketing consent is not required.':'The store must publish delivery fees before accepting order requests.'}</p></aside></form></main>;
}
