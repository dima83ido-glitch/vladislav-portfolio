"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsRead } from "@/lib/notifications/actions";
import type { NotificationSection } from "@/db/queries/notifications";

/**
 * Renders nothing — fires markNotificationsRead once this component actually
 * mounts in the DOM. Deliberately NOT a plain `await` in the page's server
 * component: Next prefetches viewport-visible <Link>s (these section pages
 * are always linked from the nav), and a server-render side effect would
 * mark things read the instant the link scrolls into view, before the user
 * ever opens the page. useEffect only runs after a real navigation lands.
 */
export function MarkSectionRead({ section }: { section: NotificationSection }) {
  const router = useRouter();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    markNotificationsRead(section).then((result) => {
      if (result.ok) router.refresh();
    });
  }, [section, router]);

  return null;
}
