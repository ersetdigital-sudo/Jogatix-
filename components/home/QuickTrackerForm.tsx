"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Home page quick-tracker: forwards the entered ID to the tracker page. */
export function QuickTrackerForm() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = value.trim();
    if (!id) return;
    router.push(`/cek-transaksi?id=${encodeURIComponent(id.toUpperCase())}`);
  }

  return (
    <form id="home-quick-tracker-form" className="home-tracking-form" onSubmit={handleSubmit}>
      <input
        type="text"
        id="home-quick-tracker-input"
        className="home-tracking-input"
        placeholder="Masukkan ID (mis. JGX-7749210)"
        aria-label="ID Transaksi"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required
      />
      <button type="submit" className="btn-lime">
        Cek Transaksi
      </button>
    </form>
  );
}
