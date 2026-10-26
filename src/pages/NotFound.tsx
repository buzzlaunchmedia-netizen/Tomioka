import { Link } from 'react-router-dom';
import BrandLogo from '@/components/layout/BrandLogo';
export default function NotFound() {return <main className="container-shell py-20"><BrandLogo className="mb-8 w-40"/><p className="eyebrow">404 / A different universe</p><h1 className="mt-5 text-4xl font-semibold">This page isn't in our world.</h1><p className="mt-4 text-muted">Let’s get you back to something worth discovering.</p><Link to="/" className="btn-primary mt-8">Back to the store</Link></main>; }
