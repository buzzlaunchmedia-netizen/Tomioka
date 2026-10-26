import { AlertCircle, LoaderCircle } from 'lucide-react';
import { useStore } from '@/stores/StoreProvider';
export default function CloudStatus() {
  const { loading, error, refresh } = useStore();
  if (!loading && !error) return null;
  return <div role={error ? 'alert' : 'status'} className="container-shell flex flex-wrap items-center gap-3 py-4 text-sm text-muted">{error ? <AlertCircle className="text-danger" size={18}/> : <LoaderCircle className="text-primary" size={18}/>}<span>{error ? 'OnSpace Cloud data is unavailable. No sample data is substituted.' : 'Loading the store from OnSpace Cloud…'}</span>{error && <button className="btn-secondary" onClick={refresh}>Retry</button>}</div>;
}
