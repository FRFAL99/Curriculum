import { useContext } from "react";
import { WindowManagerContext } from "./WindowManagerContext";

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error(
      "useWindowManager deve essere usato dentro <WindowManagerProvider>",
    );
  }
  return ctx;
}
