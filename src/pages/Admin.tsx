import { useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, SlidersHorizontal, Globe, MessageCircle, Truck, BookOpen, Users, CreditCard, ShieldCheck, Image, History, LogOut } from 'lucide-react';
import AdminOverview from '@/components/features/admin/AdminOverview';
import WebsiteEditor from '@/components/features/admin/WebsiteEditor';
import ProductManager from '@/components/features/admin/ProductManager';
import OrderManager from '@/components/features/admin/OrderManager';
import BlogManager from '@/components/features/admin/BlogManager';
import SubscriberManager from '@/components/features/admin/SubscriberManager';
import PaymentSettings from '@/components/features/admin/PaymentSettings';
import AdminSecurity from '@/components/features/admin/AdminSecurity';
import MediaLibrary from '@/components/features/admin/MediaLibrary';
import AuditLog from '@/components/features/admin/AuditLog';
import AdminPinForm from '@/components/forms/AdminPinForm';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAdminAuth } from '@/stores/AdminAuthProvider';
import { useStore } from '@/stores/StoreProvider';
const tabs = [{id:'overview',label:'Overview',icon:LayoutDashboard},{id:'website',label:'Website editor',icon:SlidersHorizontal},{id:'products',label:'Products',icon:Package},{id:'media',label:'Media library',icon:Image},{id:'orders',label:'Orders',icon:ShoppingBag},{id:'payments',label:'Paystack setup',icon:CreditCard},{id:'contact',label:'Social & contact',icon:MessageCircle},{id:'delivery',label:'Delivery settings',icon:Truck},{id:'blog',label:'Blog & updates',icon:BookOpen},{id:'newsletter',label:'Subscribers',icon:Users},{id:'seo',label:'SEO settings',icon:Globe},{id:'security',label:'Security',icon:ShieldCheck},{id:'audit',label:'Audit history',icon:History}];
export default function Admin() {
  const [params, setParams] = useSearchParams(); const tab = params.get('tab') || 'overview'; const { session, signOut } = useAdminAuth(); const { loading, error, refresh } = useStore();
  usePageMeta('Administration', 'Protected Tomioka’s Store administration.');
  if (!session) return <AdminPinForm/>;
  if (loading || error) return <main className="container-shell py-16"><h1 className="text-3xl font-semibold">{error ? 'Cloud administration could not load.' : 'Loading protected administration…'}</h1>{error && <p role="alert" className="mt-4 text-danger">{error.message}</p>}<div className="mt-6 flex gap-3">{error && <button className="btn-primary" onClick={refresh}>Retry</button>}<button className="btn-secondary" onClick={() => void signOut()}>Sign out</button></div></main>;
  return <main className="container-shell py-8"><div className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-md border border-line bg-surface p-4"><p className="text-sm text-muted"><strong className="text-primary">Protected cloud administration</strong> · Changes persist across devices.</p><button className="btn-secondary" onClick={() => void signOut()}><LogOut size={17}/>Sign out</button></div><div className="grid gap-8 lg:grid-cols-[210px_1fr]"><aside className="self-start"><p className="mb-5 hidden text-xs tracking-[.2em] text-muted lg:block">TOMIOKA / STORE CONTROL</p><nav className="flex gap-2 overflow-x-auto pb-3 lg:flex-col" aria-label="Management navigation">{tabs.map(({id,label,icon:Icon}) => <button key={id} onClick={() => setParams({tab:id})} className={`flex min-h-12 shrink-0 items-center gap-3 rounded-md px-4 py-3 text-left text-sm transition-opacity hover:opacity-80 ${tab === id ? 'bg-primary/10 text-primary' : 'text-muted'}`}><Icon size={17}/>{label}</button>)}</nav></aside><section className="min-w-0" key={tab}>{tab === 'overview' ? <AdminOverview/> : tab === 'products' ? <ProductManager/> : tab === 'media' ? <MediaLibrary/> : tab === 'orders' ? <OrderManager/> : tab === 'payments' ? <PaymentSettings/> : tab === 'blog' ? <BlogManager/> : tab === 'newsletter' ? <SubscriberManager/> : tab === 'security' ? <AdminSecurity/> : tab === 'audit' ? <AuditLog/> : ['website','contact','delivery','seo'].includes(tab) ? <WebsiteEditor mode={tab as 'website'|'contact'|'delivery'|'seo'}/> : <AdminOverview/>}</section></div></main>;
}
