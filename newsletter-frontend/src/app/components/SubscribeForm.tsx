"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "done" | "duplicate" | "error";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="font-display text-2xl text-signal">
        Thank you. The next letter will find you.
      </p>
    );
  }

  if (status === "duplicate") {
    return (
      <p className="text-lg text-signal" role="status">
        This address is already on the list. Thank you for reading.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg">
      <label htmlFor="email" className="label">
        Email address
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-w-0 flex-1 border border-rule bg-ink px-4 py-3 text-ivory placeholder:text-dim/60 focus:border-teal focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-signal px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-teal disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-[#d49a8c]">
          Couldn’t subscribe just now. Please check the address and try again.
        </p>
      )}
    </form>
  );
}
