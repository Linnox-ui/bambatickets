"use client";

import { useState } from "react";
import { Role } from "@prisma/client";
import {
  Search,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  searchHQUsers,
  changeUserRole,
  wipeUserCompletely,
} from "../../hq/actions";

export default function GodModeUserManager({
  initialUsers,
}: {
  initialUsers: any[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setUsers(initialUsers);
      return;
    }

    setLoading(true);
    const res = await searchHQUsers(val);
    if (res.success) setUsers(res.data);
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: Role) {
    setActionLoading(userId);
    const res = await changeUserRole(userId, newRole);
    if (!res.success) {
      alert(res.error);
    } else {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    }
    setActionLoading(null);
  }

  async function handleDelete(userId: string, email: string) {
    const confirmed = window.confirm(
      `CRITICAL WARNING: Are you sure you want to completely wipe ${email}? This action is irreversible and destroys all linked assets.`,
    );

    if (!confirmed) return;

    setActionLoading(userId);
    const res = await wipeUserCompletely(userId);
    if (!res.success) {
      alert(res.error);
    } else {
      setUsers(users.filter((u) => u.id !== userId));
    }
    setActionLoading(null);
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(239,68,68,0.05)] flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
        <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4 text-red-500" /> Identity Management
          [God Mode]
        </h2>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search by name or email..."
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 focus:border-red-500/50 focus:outline-none transition-colors shadow-inner"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-red-500" />
          )}
        </div>
      </div>

      <div className="overflow-x-auto flex-1 terminal-scroll relative z-10">
        <table className="w-full text-left text-sm text-slate-400 min-w-175">
          <thead className="text-[10px] font-mono uppercase bg-slate-950/80 text-slate-500 sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 rounded-tl-xl">Identity</th>
              <th className="px-4 py-3">Role Assignment</th>
              <th className="px-4 py-3">System ID</th>
              <th className="px-4 py-3 text-right rounded-tr-xl">
                Lethal Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
              >
                <td className="px-4 py-3">
                  <p className="text-white text-xs font-bold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">
                    {user.email}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <select
                    disabled={actionLoading === user.id}
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as Role)
                    }
                    className={`bg-slate-950 border text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none transition-colors ${
                      user.role === "SUPER_ADMIN"
                        ? "text-emerald-400 border-emerald-500/30"
                        : user.role === "ORGANIZER"
                          ? "text-orange-400 border-orange-500/30"
                          : "text-slate-400 border-slate-700 focus:border-red-500/50"
                    }`}
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="ORGANIZER">Organizer</option>
                    <option value="GATE_STAFF">Gate Staff</option>
                    <option value="IT_TEAM">IT Team</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 font-mono text-[9px] text-slate-600">
                  {user.id}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={actionLoading === user.id}
                    className="inline-flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:pointer-events-none"
                    title="Permanently Delete User"
                  >
                    {actionLoading === user.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Wipe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
