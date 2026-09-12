import type { ReactNode } from "react";

interface EmptyValueProps {
  children?: ReactNode;
}

/** Neutral placeholder for a compact card field with no value. */
export function EmptyValue({ children = "—" }: EmptyValueProps) {
  return <span style={{ color: "#c1c1c1" }}>{children}</span>;
}