"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editCampaignAction } from "@/src/actions/edit-campaign";
import { CalendarClock, Timer } from "lucide-react"; // ✨ NEW
import { toast } from "sonner"; // ✨ NEW

type CandidateInput = { id?: string; name: string; file: File | null; preview: string };

// Helper to convert DB ISO string to HTML datetime-local format
const formatForInput = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function EditPollForm({ initialCampaign }: { initialCampaign: any }) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialCampaign.title);
  const [slug] = useState(initialCampaign.slug); 
  
  // ✨ PRE-POPULATE DATES FROM DB
  const [startDate, setStartDate] = useState(formatForInput(initialCampaign.start_date));
  const [endDate, setEndDate] = useState(formatForInput(initialCampaign.end_date));

  const [candidates, setCandidates] = useState<CandidateInput[]>(
    initialCampaign.candidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      file: null,
      preview: c.image_url || "",
    }))
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after the start date.");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Saving changes...");

    const formData = new FormData();
    formData.append("campaignId", initialCampaign.id);
    formData.append("title", title);
    formData.append("startDate", new Date(startDate).toISOString()); // ✨ APPEND
    formData.append("endDate", new Date(endDate).toISOString());     // ✨ APPEND
    formData.append("candidateCount", validCandidates.length.toString());

    validCandidates.forEach((c, index) => {
      formData.append(`candidate_${index}_name`, c.name);
      if (c.id) {
        formData.append(`candidate_${index}_id`, c.id);
      }
      if (c.file) {
        formData.append(`candidate_${index}_image`, c.file);
      }
    });

    try {
      const result = await editCampaignAction(formData);
      
      if (result.error) throw new Error(result.error);

      toast.success("Campaign updated successfully!", { id: toastId });
      router.push(`/polls/dashboard`);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to update campaign.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm animate-fade-in-up">
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
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-1.5 items-center justify-between">
            <span>URL Slug (Locked)</span>
          </label>
          <div className="flex rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden opacity-70 cursor-not-allowed">
            <span className="flex items-center px-4 bg-slate-800/30 text-slate-500 text-sm">
              bambatickets.com/polls/
            </span>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full bg-transparent text-slate-400 px-4 py-3 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>

        {/* ✨ TIMELINE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 focus-within:border-emerald-500/50 transition-colors">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <CalendarClock className="w-4 h-4 text-emerald-400" />
              Goes Live At
            </label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm color-scheme-dark"
            />
          </div>
          
          <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 focus-within:border-orange-500/50 transition-colors">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Timer className="w-4 h-4 text-orange-500" />
              Closes At
            </label>
            <input
              type="datetime-local"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all text-sm color-scheme-dark"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-slate-300">Nominees</label>
          <span className="text-xs text-slate-500 font-mono">Tap avatar to change photo</span>
        </div>
        
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <div key={index} className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 focus-within:border-slate-700 transition-colors group">
              
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
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>

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
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-mono font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.2)] hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] disabled:shadow-none mt-4 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Saving Changes...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}