import type React from "react";

export function normalizePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function isSameRoute(targetPath: string) {
  if (typeof window === "undefined") return false;
  const target = new URL(targetPath, window.location.origin);
  return window.location.pathname === target.pathname;
}

export function goToPath(path: string) {
  if (typeof window === "undefined") return;

  const targetPath = normalizePath(path);

  // If the user taps the same CTA repeatedly, still give a visible action.
  // This avoids the mobile/Safari issue where navigating to the same SPA route
  // can appear to do nothing after the first tap.
  if (isSameRoute(targetPath)) {
    window.history.replaceState(null, "", targetPath);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    return;
  }

  window.location.href = targetPath;
}

export function goToWaitlist() {
  if (typeof window === "undefined") return;

  const scrollToWaitlist = () => {
    const el = document.getElementById("waitlist");
    if (!el) return false;

    // Run immediately and again after a frame so repeated taps work even when
    // the browser address/hash is already the same.
    el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    window.setTimeout(() => {
      document.getElementById("waitlist")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }, 80);

    window.history.replaceState(null, "", "/#waitlist");
    return true;
  };

  const isHome = window.location.pathname === "/" || window.location.pathname === "";

  if (isHome && scrollToWaitlist()) return;

  window.location.href = "/#waitlist";
}

export function handleWaitlistClick(event?: React.MouseEvent<HTMLElement> | MouseEvent) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  goToWaitlist();
}

export function handlePathClick(path: string, event?: React.MouseEvent<HTMLElement> | MouseEvent) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  goToPath(path);
}
