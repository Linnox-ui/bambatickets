"use client";

import { useState } from "react";
import { searchHQUsers } from "../actions";
import { Search, Loader2, Radar } from "lucide-react";

type RadarUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
};

export default function UserSearchRadar({
  initialUsers,
}: {
  initialUsers: RadarUser[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RadarUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults(initialUsers);
      return;
    }

    setLoading(true);
    const res = await searchHQUsers(query);
    if (res.success && res.data) {
      setResults(res.data);
    }
    setLoading(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "SUPERVISOR":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "IT_TEAM":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "ORGANIZER":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.05)_0%,transparent_60%)] pointer-events-none transition-all duration-700 group-hover:bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.1)_0%,transparent_70%)]" />

      <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest mb-6 relative z-10">
        <Radar className="w-4 h-4 text-cyan-500" /> Identity Radar
      </h2>

      <form onSubmit={handleSearch} className="relative z-10 mb-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Scan by name or email..."
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 text-xs text-white rounded-xl pl-10 pr-4 py-3 outline-none transition-all placeholder:text-slate-600 font-mono shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-slate-950 p-1.5 rounded-lg transition-all border border-cyan-500/20"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Radar className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto terminal-scroll pr-2 space-y-2 relative z-10">
        {results.length === 0 ? (
          <div className="text-xs text-slate-500 font-mono text-center py-8">
            No identities matched the scan parameters.
          </div>
        ) : (
          results.map((user) => (
            <div
              key={user.id}
              className="p-3 bg-slate-950/40 border border-slate-800/50 hover:border-slate-700/80 rounded-2xl flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3 truncate">
                <div
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center border font-black text-[9px] ${getRoleBadge(
                    user.role,
                  )}`}
                >
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="font-bold text-xs text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[9px] font-mono text-slate-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <span
                className={`ml-2 shrink-0 text-[8px] font-mono font-bold px-2 py-1 rounded border shadow-inner ${getRoleBadge(
                  user.role,
                )}`}
              >
                {user.role.replace("_", " ")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
