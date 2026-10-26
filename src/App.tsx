import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { StoreProvider } from '@/stores/StoreProvider';
import AdminAuthProvider from '@/stores/AdminAuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LightningIntro from '@/components/features/LightningIntro';
import ErrorBoundary from '@/components/features/ErrorBoundary';
import CloudStatus from '@/components/features/CloudStatus';
import PageMetadata from '@/components/features/PageMetadata';
import ScrollToTop from '@/components/layout/ScrollToTop';
import Home from '@/pages/Home';
const Shop=lazy(()=>import('@/pages/Shop')); const ProductDetail=lazy(()=>import('@/pages/ProductDetail')); const Cart=lazy(()=>import('@/pages/Cart')); const Checkout=lazy(()=>import('@/pages/Checkout')); const Wishlist=lazy(()=>import('@/pages/Wishlist')); const Tracking=lazy(()=>import('@/pages/Tracking')); const Journal=lazy(()=>import('@/pages/Journal')); const Information=lazy(()=>import('@/pages/Information')); const Admin=lazy(()=>import('@/pages/Admin')); const Robot=lazy(()=>import('@/pages/robot')); const Unsubscribe=lazy(()=>import('@/pages/Unsubscribe')); const NotFound=lazy(()=>import('@/pages/NotFound'));
const queryClient=new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:true}}});
export default function App() {
  return <ErrorBoundary><QueryClientProvider client={queryClient}><AdminAuthProvider><StoreProvider><BrowserRouter><ScrollToTop/><PageMetadata/><LightningIntro/><Header/><CloudStatus/><Suspense fallback={<main className="container-shell min-h-[400px] py-20"><p className="eyebrow">Loading your world…</p></main>}><Routes><Route path="/" element={<Home/>}/><Route path="/shop" element={<Shop/>}/><Route path="/product/:slug" element={<ProductDetail/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<Checkout/>}/><Route path="/wishlist" element={<Wishlist/>}/><Route path="/track" element={<Tracking/>}/><Route path="/blog" element={<Journal/>}/><Route path="/blog/:slug" element={<Journal/>}/><Route path="/about" element={<Information/>}/><Route path="/contact" element={<Information/>}/><Route path="/policies/:kind" element={<Information/>}/><Route path="/admin" element={<Admin/>}/><Route path="/robot" element={<Robot/>}/><Route path="/unsubscribe" element={<Unsubscribe/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense><Footer/><Toaster position="bottom-right" theme="dark" richColors/></BrowserRouter></StoreProvider></AdminAuthProvider></QueryClientProvider></ErrorBoundary>;
}
