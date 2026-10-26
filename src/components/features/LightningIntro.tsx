import { useEffect,useState, type CSSProperties } from 'react';
import { useStore } from '@/stores/StoreProvider';
import BrandLogo from '@/components/layout/BrandLogo';
export default function LightningIntro() {
const {data}=useStore(); const [visible,setVisible]=useState(data.settings.introEnabled && !/^\/(checkout|track|admin)/.test(location.pathname));
useEffect(()=>{ if(!data.settings.introEnabled){setVisible(false);return;} const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches; const timer=setTimeout(()=>setVisible(false),reduced?150:Math.min(2200,Math.max(800,data.settings.introDuration*1000))); return ()=>clearTimeout(timer); },[data.settings.introDuration,data.settings.introEnabled]);
if (!visible) return null;
return <div aria-hidden="true" className="intro pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background" style={{'--intro-duration':`${data.settings.introDuration}s`} as CSSProperties}><svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="none"><path className="bolt" d="M200 0L260 160 210 170 370 330 310 335 540 600M370 330L520 320 680 420M210 170L100 290 160 370"/><path className="bolt second" d="M1050 0L880 200 940 190 790 390 820 380 660 660M790 390L940 470 1020 690"/></svg><div className="intro-logo flex flex-col items-center"><BrandLogo className="w-64 sm:w-80"/><p className="eyebrow mt-7">Enter your world</p></div></div>;
}
