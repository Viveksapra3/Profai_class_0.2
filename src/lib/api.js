"use client";

export const API_BASE = ""; // Use local Next.js API routes

export async function apiGet(path, opts = {}) {
  const res = await fetch(`${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }
  return { ok: res.ok, status: res.status, data };
}

export async function apiPost(path, body = {}, opts = {}) {
  const res = await fetch(`${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    body: JSON.stringify(body),
    ...opts,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }
  return { ok: res.ok, status: res.status, data };
}
