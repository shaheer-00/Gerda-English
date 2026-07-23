import { useState, useEffect, FormEvent, ReactNode } from 'react';
import { Lock } from 'lucide-react';

const STORAGE_KEY = 'gerda_admin_unlocked';

const AdminGate = ({ children }: { children: ReactNode }) => {
  const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'gerda-admin';
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input === configuredPassword) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Wrong password');
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="card-warm text-center">
        <Lock className="w-10 h-10 mx-auto mb-4 text-warm-terracotta-400" />
        <h2 className="text-xl font-bold text-warm-brown-800 mb-4">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Password"
            className="input-warm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="btn-warm btn-warm-primary w-full">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminGate;
