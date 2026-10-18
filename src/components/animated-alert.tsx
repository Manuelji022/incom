"use client";

import type { ReactNode } from "react";
import { usePresence } from "@/hooks/use-presence";

type AnimatedAlertProps = {
  visible: boolean;
  children: ReactNode;
  className?: string;
};

export function AnimatedAlert({ visible, children, className = "" }: AnimatedAlertProps) {
  const { rendered, present } = usePresence(visible);

  if (!rendered) return null;

  return (
    <div
      role="alert"
      aria-hidden={visible ? undefined : true}
      data-visible={present}
      className={`animated-alert ${className}`.trim()}
    >
      {children}
    </div>
  );
}
