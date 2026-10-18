"use client";

import { useEffect, useState } from "react";

const defaultDuration = 200;

type Presence = {
  rendered: boolean;
  present: boolean;
};

export function usePresence(visible: boolean, duration = defaultDuration): Presence {
  const [rendered, setRendered] = useState(visible);
  const [present, setPresent] = useState(visible);

  useEffect(() => {
    if (visible) {
      let presentFrame: number | undefined;
      const renderFrame = window.requestAnimationFrame(() => {
        setRendered(true);
        presentFrame = window.requestAnimationFrame(() => setPresent(true));
      });
      return () => {
        window.cancelAnimationFrame(renderFrame);
        if (presentFrame !== undefined) window.cancelAnimationFrame(presentFrame);
      };
    }

    const exitFrame = window.requestAnimationFrame(() => setPresent(false));
    const timeout = window.setTimeout(() => setRendered(false), duration);
    return () => {
      window.cancelAnimationFrame(exitFrame);
      window.clearTimeout(timeout);
    };
  }, [duration, visible]);

  return { rendered, present };
}
