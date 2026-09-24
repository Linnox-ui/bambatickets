"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Settings, 
  Share2, 
  Download, 
  Edit, 
  Trash2, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { deleteCampaignAction } from "@/src/actions/campaign-actions";
import { toast } from "sonner"; // ✨ NEW IMPORT

interface CampaignActionsMenuProps {
  campaignId: string;
  campaignSlug: string;
}

export default function CampaignActionsMenu({ campaignId, campaignSlug }: CampaignActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/polls/${campaignSlug}`;
    navigator.clipboard.writeText(url);
    setIsOpen(false);
    
    // ✨ WORLD CLASS TOAST NOTIFICATION
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    // ✨ TRIGGER A LOADING TOAST
    const toastId = toast.loading("Deleting campaign...");

    const result = await deleteCampaignAction(campaignId);
    
    if (result.error) {
      setIsDeleting(false);
      // ✨ UPDATE TOAST TO ERROR
      toast.error(result.error, { id: toastId });
    } else {
      // ✨ UPDATE TOAST TO SUCCESS
      toast.success("Campaign deleted successfully", { id: toastId });
      // We don't need to close the menu because the server action will instantly 
      // revalidate the page and remove this entire component from the DOM!
    }
  };

  return (
    <div className="relative">
      
      {/* Quick Action Buttons (Desktop) */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleCopyLink}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700 hidden sm:block" 
          title="Copy Share Link"
        >
          <Share2 className="w-4 h-4" />
        </button>
        
        {/* Toggle Dropdown Menu */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2.5 rounded-xl transition-all border ${
            isOpen 
              ? "bg-slate-800 text-white border-slate-700 shadow-inner" 
              : "text-slate-500 hover:text-white hover:bg-slate-800 border-transparent hover:border-slate-700"
          }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Invisible backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => { setIsOpen(false); setShowConfirm(false); }}
          />
          
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fade-in-up origin-bottom-right">
            
            {showConfirm ? (
              <div className="p-4 bg-red-500/10">
                <div className="flex items-center gap-2 text-red-400 mb-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Are you sure?
                </div>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  This will permanently delete this campaign, all candidates, and all recorded votes.
                </p>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-1.5 flex flex-col gap-0.5">
                <button 
                  onClick={handleCopyLink}
                  className="sm:hidden flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-500" /> Copy Link
                </button>
                
                <Link 
                  href={`/polls/edit/${campaignId}`}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4 text-slate-500" /> Edit Campaign
                </Link>

                <div className="h-px bg-slate-800/80 my-1 mx-2" />

                <button 
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-red-500/70 group-hover:text-red-400" /> Delete Campaign
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}