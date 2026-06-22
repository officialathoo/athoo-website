import type React from "react";

export function normalizePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function stopEvent(event?: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | React.PointerEvent<HTMLElement> | MouseEvent | TouchEvent | PointerEvent) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
}

function scrollToElement(id: string) {
  if (typeof window === "undefined") return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const stickyOffset = window.innerWidth < 768 ? 88 : 96;
  const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
  window.history.replaceState(null, "", `/#${id}`);
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  return true;
}

export function goToWaitlist() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/" && scrollToElement("waitlist")) return;
  window.location.assign(`/#waitlist`);
}

export function goToProvider() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/become-provider" && scrollToElement("provider-form")) return;
  window.location.assign(`/become-provider#provider-form`);
}

export function goToPath(path: string) {
  if (typeof window === "undefined") return;
  const targetPath = normalizePath(path);
  if (targetPath === "/become-provider") {
    goToProvider();
    return;
  }
  window.location.assign(targetPath);
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
