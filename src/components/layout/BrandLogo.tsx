import { useStore } from '@/stores/StoreProvider';
interface Props { className?: string; }
export default function BrandLogo({className='w-28'}:Props) { const {data}=useStore(); return <img src={data.settings.logo} alt="Tomioka's Store" className={`h-auto object-contain ${className}`} />; }
