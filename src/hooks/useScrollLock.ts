"use client";

import { useEffect } from "react";

/**
 * Locks background scroll (including iOS touch/rubber-band scroll) while
 * `active` is true, and restores the exact scroll position on unlock with
 * no layout shift. Uses `position: fixed` on <body> rather than a plain
 * `overflow: hidden` toggle — overflow-hidden alone doesn't stop iOS
 * Safari's touch scrolling and doesn't compensate for the scrollbar
 * disappearing (causing a horizontal layout shift on desktop).
 *
 * Module-level ref count so nested/simultaneous overlays (e.g. a second
 * drawer opened while one is already open) don't unlock each other early.
 */
let lockCount = 0;
let savedScrollY = 0;

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      savedScrollY = window.scrollY;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.paddingRight = "";
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [active]);
}
