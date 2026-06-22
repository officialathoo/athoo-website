const REVEAL_SELECTORS = [
  ".athoo-reveal",
  ".athoo-reveal-left",
  ".athoo-reveal-right",
  ".athoo-reveal-scale",
  ".athoo-reveal-fade",
].join(",");

let observer: IntersectionObserver | null = null;

function createObserver() {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return null;
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
}

export function initScrollReveal() {
  if (typeof window === "undefined") return;

  if (observer) {
    observer.disconnect();
  }
  observer = createObserver();
  if (!observer) return;

  const elements = document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS);
  elements.forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      observer!.observe(el);
    }
  });
}

export function refreshScrollReveal() {
  if (!observer) {
    initScrollReveal();
    return;
  }
  const elements = document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS);
  elements.forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      observer!.observe(el);
    }
  });
}
