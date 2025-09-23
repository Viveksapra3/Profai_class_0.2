"use client";

import { useMemo } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function ClassPage() {
  const params = useParams();
  const courseId = params?.courseId;
  const search = useSearchParams();
  const returnUrl = useMemo(() => search?.get("return") || "/", [search]);

  const { loading, user, error } = useSession();

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

  if (error) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff"}}>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#b91c1c",fontWeight:600,marginBottom:12}}>{error}</div>
          <a href={returnUrl} style={{padding:"10px 16px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Back</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #e5e7eb",background:"#fff"}}>
        <div style={{fontWeight:700}}>Live Class • Course {courseId}</div>
        <div style={{display:"flex",gap:8}}>
          <a href={returnUrl} style={{padding:"8px 12px",border:"1px solid #e5e7eb",borderRadius:8,background:"#f9fafb"}}>Exit</a>
        </div>
      </header>

      <main style={{flex:1,display:"grid",gridTemplateColumns:"1fr 320px"}}>
        <section style={{padding:16}}>
          {/* TODO: mount R3F scene / class UI here */}
          <div style={{height:"100%",border:"1px solid #e5e7eb",borderRadius:12,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>Welcome, {user?.username || user?.email || "Student"}</div>
              <div style={{color:"#6b7280"}}>Your authenticated session was shared from the main app.</div>
            </div>
          </div>
        </section>
        <aside style={{borderLeft:"1px solid #e5e7eb",background:"#fafafa",padding:16}}>
          <div style={{fontWeight:700,marginBottom:12}}>Class Panel</div>
          <ul style={{listStyle:"disc",paddingLeft:18,color:"#374151"}}>
            <li>Session verified via /api/session</li>
            <li>Course ID: {String(courseId)}</li>
          </ul>
        </aside>
      </main>
    </div>
  );
}
