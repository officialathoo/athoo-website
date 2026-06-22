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

function scrollToElement(id: string) {
  if (typeof window === "undefined") return false;
  const el = document.getElementById(id);
  if (!el) return false;

  const offset = window.innerWidth < 768 ? 110 : 92;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.history.replaceState(null, "", `#${id}`);
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });

  window.setTimeout(() => {
    const input = el.querySelector<HTMLInputElement>('input[type="email"], input, textarea, select');
    input?.focus({ preventScroll: true });
  }, 650);

  return true;
}

export function goToWaitlist() {
  if (typeof window === "undefined") return;

  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/" && scrollToElement("waitlist")) return;

  hardNavigate(`/?cta=waitlist&ts=${uniqueStamp()}#waitlist`);
}

export function goToProvider() {
  if (typeof window === "undefined") return;

  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/become-provider" && (scrollToElement("provider-form") || scrollToElement("become-provider"))) return;

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
