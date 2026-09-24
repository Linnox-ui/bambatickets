"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CandidateInput = { name: string; file: File | null; preview: string };

export default function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [candidates, setCandidates] = useState<CandidateInput[]>([
    { name: "", file: null, preview: "" },
    { name: "", file: null, preview: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const handleCandidateName = (index: number, name: string) => {
    const newCands = [...candidates];
    newCands[index].name = name;
    setCandidates(newCands);
  };

  const handleCandidateImage = (index: number, file: File | null) => {
    const newCands = [...candidates];
    if (file) {
      newCands[index].file = file;
      newCands[index].preview = URL.createObjectURL(file);
    }
    setCandidates(newCands);
  };

  const addCandidate = () => setCandidates([...candidates, { name: "", file: null, preview: "" }]);
  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validCandidates = candidates.filter(c => c.name.trim() !== "");
    if (validCandidates.length < 2) {
      setError("You must provide at least 2 nominees.");
      setLoading(false);
      return;
    }

    // We use FormData to send files to the server
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("candidateCount", validCandidates.length.toString());

    validCandidates.forEach((c, index) => {
      formData.append(`candidate_${index}_name`, c.name);
      if (c.file) {
        formData.append(`candidate_${index}_image`, c.file);
      }
    });

    try {
      const res = await fetch("/api/polls/create", {
        method: "POST",
        body: formData, // Notice no Content-Type header; the browser sets it automatically with boundaries
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push(`/polls/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Campaign Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g. Creator of the Year"
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">URL Slug</label>
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50 transition-all overflow-hidden">
            <span className="flex items-center px-4 bg-slate-800/50 text-slate-500 text-sm">
              bambatickets.com/polls/
            </span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full bg-transparent text-slate-100 px-4 py-3 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-slate-300">Nominees</label>
          <span className="text-xs text-slate-500 font-mono">Tap avatar to add photo</span>
        </div>
        
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <div key={index} className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 focus-within:border-slate-700 transition-colors group">
              
              {/* Avatar Upload Circle */}
              <div className="relative w-12 h-12 shrink-0 cursor-pointer overflow-hidden rounded-full border border-slate-700 bg-slate-800 hover:border-orange-500/50 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCandidateImage(index, e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {candidate.preview ? (
                  <img src={candidate.preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:text-orange-400 bg-linear-to-br from-slate-800 to-slate-900">
                    {/* Elegant Camera Icon */}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name Input */}
              <input
                type="text"
                required
                value={candidate.name}
                onChange={(e) => handleCandidateName(index, e.target.value)}
                placeholder={`Nominee ${index + 1}`}
                className="flex-1 bg-transparent text-slate-100 px-2 py-2 focus:outline-none placeholder:text-slate-600"
              />
              
              {candidates.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeCandidate(index)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                  title="Remove nominee"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCandidate}
          className="mt-5 text-xs text-slate-400 hover:text-orange-500 font-mono uppercase tracking-widest flex items-center gap-2 transition-colors px-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Nominee
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] disabled:shadow-none mt-4"
      >
        {loading ? "Initializing Campaign..." : "Launch Campaign"}
      </button>
    </form>
  );
}