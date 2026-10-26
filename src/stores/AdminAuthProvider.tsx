import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminAction, invoke } from '@/lib/api';
import type { AdminSession } from '@/types/cloud';
import { toast } from 'sonner';
interface AuthContext { session: AdminSession | null; signIn: (pin: string) => Promise<void>; signOut: () => Promise<void>; }
const Context = createContext<AuthContext | null>(null);
const KEY = 'tomioka-admin-session';
export default function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const clear = () => { sessionStorage.removeItem(KEY); setSession(null); };
  useEffect(() => {
    const saved = sessionStorage.getItem(KEY);
    if (saved) { try { const parsed = JSON.parse(saved) as AdminSession; if (typeof parsed.token === 'string' && new Date(parsed.expiresAt).getTime() > Date.now()) setSession(parsed); else sessionStorage.removeItem(KEY); } catch { sessionStorage.removeItem(KEY); } }
    window.addEventListener('store-admin-expired', clear);
    return () => window.removeEventListener('store-admin-expired', clear);
  }, []);
  useEffect(() => { if (!session) return; const timer = setTimeout(clear, Math.max(0, new Date(session.expiresAt).getTime() - Date.now())); return () => clearTimeout(timer); }, [session]);
  const signIn = async (pin: string) => { const result = await invoke<AdminSession>('store-admin', { action: 'login', payload: { pin } }); sessionStorage.setItem(KEY, JSON.stringify(result)); setSession(result); };
  const signOut = async () => { const token = session?.token; clear(); if (token) await adminAction(token, 'logout').catch(e => toast.error(e instanceof Error ? e.message : 'Unable to revoke the server session.')); };
  return <Context.Provider value={{ session, signIn, signOut }}>{children}</Context.Provider>;
}
export function useAdminAuth() { const value = useContext(Context); if (!value) throw new Error('Admin authentication provider missing.'); return value; }
