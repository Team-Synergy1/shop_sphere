"use client";

import { useRef } from "react";
import { useStore } from "@/store/useStore";

export function StoreProvider({ children }) {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = useStore.getState();
  }

  return <>{children}</>;
}