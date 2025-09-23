"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { apiPost } from "@/lib/api";

export default function SessionPage() {
  const { loading, user, error, refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { ok, data } = await apiPost("/api/logout", {});
      setMessage(data?.message || (ok ? "Logged out" : "Failed to logout"));
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{maxWidth:720,margin:"40px auto",padding:"0 16px"}}>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:12}}>Session Inspector</h1>
      {loading ? (
        <div>Loading session…</div>
      ) : error ? (
        <div style={{color:"#b91c1c"}}>Status: {error}</div>
      ) : (
        <div style={{color:"#16a34a"}}>Status: Authenticated</div>
      )}

      <div style={{marginTop:16}}>
        <pre style={{background:"#f8fafc",padding:12,borderRadius:8,border:"1px solid #e5e7eb",overflow:"auto"}}>
{JSON.stringify({ user }, null, 2)}
        </pre>
      </div>

      <div style={{display:"flex",gap:8,marginTop:16}}>
        <button onClick={refresh} disabled={busy} style={{padding:"8px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Refresh</button>
        <button onClick={handleLogout} disabled={busy} style={{padding:"8px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff0f0",color:"#991b1b"}}>{busy ? "Logging out…" : "Logout (server)"}</button>
      </div>

      {message ? <div style={{marginTop:12,color:"#334155"}}>{message}</div> : null}

      <div style={{marginTop:24}}>
        <a href="/" style={{textDecoration:"underline"}}>Home</a>
      </div>
    </div>
  );
}
