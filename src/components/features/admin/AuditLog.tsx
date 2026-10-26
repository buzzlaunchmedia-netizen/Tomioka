import { useStore } from '@/stores/StoreProvider';
export default function AuditLog() {
  const { audit } = useStore();
  return <section><p className="eyebrow">Recorded server activity</p><h1 className="my-4 text-3xl font-semibold">Audit history.</h1><div className="space-y-3">{audit.map(entry => <div key={entry.id} className="panel"><p className="font-medium">{entry.action.replace(/_/g, ' ')}</p><p className="mt-2 break-all text-sm text-muted">{new Date(entry.created_at).toLocaleString('en-NG')}{entry.target && ` · ${entry.target}`}</p></div>)}</div>{!audit.length && <p className="panel text-muted">No recorded actions yet.</p>}</section>;
}
