'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';

interface ErrorScreenProps {
  error: Error;
  handleLogout: () => void;
}

export default function ErrorScreen({ error, handleLogout }: ErrorScreenProps) {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md shadow-2xl">
        <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
        <p className="text-red-400 text-sm mb-6">{error.message || 'An unknown error occurred during login.'}</p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => loginWithRedirect()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/10 active:scale-95 transition-all"
          >
            Try Again
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-slate-400 hover:text-slate-200"
          >
            Clear Session
          </Button>
        </div>
      </div>
    </div>
  );
}
