'use client';

import { motion } from 'framer-motion';
import { Layers, Zap, Shield, ArrowRight, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const PROFILES = [
  {
    token: 'dummy_owner',
    sub: 'auth0|65f123456789abcdef012345',
    name: 'John Doe',
    email: 'john.doe@example.com',
    roles: ['owner'],
    avatar: 'JD',
    color: 'from-violet-500 to-indigo-600',
    badge: 'Owner',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    description: 'Full workspace access — create, manage, and delete everything.',
  },
  {
    token: 'dummy_jane',
    sub: 'auth0|9876543210fedcba98765432',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    roles: ['member'],
    avatar: 'JS',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Member',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Collaborate on tasks and projects inside shared workspaces.',
  },
];

export default function AuthGate() {
  const login = useAuthStore((s) => s.login);

  const handleSelect = (profile: typeof PROFILES[0]) => {
    localStorage.setItem('cosync_token', profile.token);
    login(profile.token, {
      sub: profile.sub,
      name: profile.name,
      email: profile.email,
      roles: profile.roles,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-2xl shadow-indigo-500/30 mb-4">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">CoSync</h1>
          <p className="text-slate-400 mt-1 text-sm">Real-Time Collaboration Platform</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Simulated Auth Session</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Choose your profile</h2>
          <p className="text-slate-400 text-sm mb-6">
            Select a mock session to explore CoSync. Replace with real Auth0 credentials in production.
          </p>

          <div className="flex flex-col gap-3">
            {PROFILES.map((profile) => (
              <motion.button
                key={profile.token}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleSelect(profile)}
                className="group relative w-full flex items-center gap-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl p-4 text-left transition-all duration-200"
              >
                <div className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${profile.color} flex items-center justify-center font-bold text-white text-sm shadow-lg`}>
                  {profile.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-sm">{profile.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${profile.badgeColor}`}>
                      {profile.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{profile.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </motion.button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              Sessions use dummy JWT tokens decoded by the NestJS <code className="text-amber-300 bg-slate-700/60 px-1 rounded">AuthGuard</code> — no real credentials required.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6 flex items-center justify-center gap-1.5">
          <Users className="h-3 w-3" />
          Built for portfolio demonstration · CoSync MVP v1.0
        </p>
      </motion.div>
    </div>
  );
}
