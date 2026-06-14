"use client";

import { Layers } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center z-10">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-2xl shadow-indigo-500/30 mb-6">
          <Layers className="h-8 w-8 text-white" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm font-medium">
          Authenticating with Auth0...
        </p>
      </div>
    </div>
  );
}
