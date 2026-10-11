"use client";

import { useSyncExternalStore } from "react";

/** URL search params never change without a navigation we control. */
function subscribe() {
  return () => {};
}

/**
 * Reads a query-string value without triggering a hydration mismatch or a
 * setState-in-effect. React uses the empty server snapshot while hydrating,
 * then switches to the real value from the browser URL.
 */
export function useSearchParam(key: string): string {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(key) ?? "",
    () => "",
  );
}
