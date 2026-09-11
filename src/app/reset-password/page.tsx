import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import { Loader2 } from "lucide-react";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Suspense
        fallback={
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin relative z-10" />
        }
      >
        <ResetPasswordForm
          token={resolvedParams.token || ""}
          email={resolvedParams.email || ""}
        />
      </Suspense>
    </div>
  );
}
