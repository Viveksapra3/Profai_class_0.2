"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

function ApiLandingContent() {
  const search = useSearchParams();
  const router = useRouter();
  const courseId = useMemo(() => search?.get("courseId") || "", [search]);
  const returnUrl = useMemo(() => search?.get("return") || "/", [search]);

  const { loading, user, error, refresh } = useSession();

  const goToClass = () => {
    if (!courseId) return;
    router.push(`/class/${encodeURIComponent(courseId)}?return=${encodeURIComponent(returnUrl)}`);
  };

  if (loading) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f6f7fb"}}>
        <div>
          <div style={{height:8,width:120,background:"#e5e7eb",borderRadius:999,marginBottom:12}}></div>
          <div style={{height:48,width:280,background:"#e5e7eb",borderRadius:12}}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:860,margin:"40px auto",padding:"0 16px"}}>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:8}}>Session Landing</h1>
      <div style={{color:error ? "#b91c1c" : "#16a34a"}}>
        {error ? `Status: ${error}` : "Status: Authenticated"}
      </div>

      <div style={{marginTop:16}}>
        <div style={{fontWeight:700,marginBottom:6}}>Parameters</div>
        <pre style={{background:"#f8fafc",padding:12,borderRadius:8,border:"1px solid #e5e7eb",overflow:"auto"}}>
{JSON.stringify({ courseId, return: returnUrl }, null, 2)}
        </pre>
      </div>

      <div style={{marginTop:16}}>
        <div style={{fontWeight:700,marginBottom:6}}>User</div>
        <pre style={{background:"#f8fafc",padding:12,borderRadius:8,border:"1px solid #e5e7eb",overflow:"auto"}}>
{JSON.stringify({ user }, null, 2)}
        </pre>
      </div>

      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={refresh} style={{padding:"8px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Refresh Session</button>
        {courseId ? (
          <button onClick={goToClass} style={{padding:"8px 12px",border:"1px solid #111827",borderRadius:8,background:"#111827",color:"#fff"}}>Continue to Class</button>
        ) : null}
        <a href={returnUrl} style={{padding:"8px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Back</a>
      </div>

      <div style={{marginTop:24}}>
        <a href="/session" style={{textDecoration:"underline"}}>Open Session Inspector</a>
      </div>
    </div>
  );
}

export default function ApiLandingPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f6f7fb"}}>
      <div>
        <div style={{height:8,width:120,background:"#e5e7eb",borderRadius:999,marginBottom:12}}></div>
        <div style={{height:48,width:280,background:"#e5e7eb",borderRadius:12}}></div>
      </div>
    </div>}>
      <ApiLandingContent />
    </Suspense>
  );
}
