import type React from "react";

export function normalizePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function uniqueStamp() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function hardNavigate(url: string) {
  if (typeof window === "undefined") return;
  window.location.assign(url);
}

export function goToWaitlist() {
  if (typeof window === "undefined") return;

  // Always change the URL with a fresh timestamp so iOS/Safari fires the action
  // every time, even after the user already clicked the same bottom CTA once.
  hardNavigate(`/?cta=waitlist&ts=${uniqueStamp()}#waitlist`);
}

export function goToProvider() {
  if (typeof window === "undefined") return;

  // Always change the URL with a fresh timestamp so repeated taps on mobile
  // never become a no-op. The provider page will scroll to the form on load.
  hardNavigate(`/become-provider?cta=provider&ts=${uniqueStamp()}#provider-form`);
}

export function goToPath(path: string) {
  if (typeof window === "undefined") return;

  const targetPath = normalizePath(path);

  if (targetPath === "/become-provider") {
    goToProvider();
    return;
  }

  hardNavigate(targetPath);
}

function stopEvent(event?: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.PointerEvent<HTMLElement> | MouseEvent | TouchEvent | PointerEvent) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
}

export function handleWaitlistClick(event?: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.PointerEvent<HTMLElement> | MouseEvent | TouchEvent | PointerEvent) {
  stopEvent(event);
  goToWaitlist();
}

export function handleProviderClick(event?: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.PointerEvent<HTMLElement> | MouseEvent | TouchEvent | PointerEvent) {
  stopEvent(event);
  goToProvider();
}

export function handlePathClick(path: string, event?: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.PointerEvent<HTMLElement> | MouseEvent | TouchEvent | PointerEvent) {
  stopEvent(event);
  goToPath(path);
}
