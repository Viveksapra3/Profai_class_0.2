"use client";

import React from "react";
import { useSession } from "@/hooks/useSession";

export function SessionGate({ children, fallback, redirectUrl }) {
  const { loading, user, error, refresh } = useSession();

  if (loading) {
    return fallback || (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f6f7fb"}}>
        <div>
          <div style={{height:8,width:120,background:"#e5e7eb",borderRadius:999,marginBottom:12}}></div>
          <div style={{height:48,width:280,background:"#e5e7eb",borderRadius:12}}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff"}}>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#b91c1c",fontWeight:600,marginBottom:12}}>{error}</div>
          {redirectUrl ? (
            <a href={redirectUrl} style={{padding:"10px 16px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Go to sign-in</a>
          ) : null}
          <div style={{marginTop:8}}>
            <button onClick={refresh} style={{padding:"8px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
