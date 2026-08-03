import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted">
      <Loader2 className="h-7 w-7 animate-spin text-accent" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
