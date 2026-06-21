import React from "react";

type MotionLikeProps = React.HTMLAttributes<HTMLElement> & {
  initial?: unknown;
  animate?: unknown;
  whileInView?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  exit?: unknown;
  transition?: unknown;
  viewport?: { once?: boolean; amount?: number } | unknown;
  layout?: unknown;
};

const STRIP_PROPS = new Set([
  "initial",
  "animate",
  "whileInView",
  "whileHover",
  "whileTap",
  "exit",
  "transition",
  "viewport",
  "layout",
]);

function useReveal(enabled: boolean, once: boolean) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!enabled || !element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          if (once) observer.disconnect();
        } else if (!once) {
          element.classList.remove("is-visible");
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, once]);

  return ref;
}

function createMotionTag(tag: string) {
  return React.forwardRef<HTMLElement, MotionLikeProps>((props, forwardedRef) => {
    const reveal = Boolean(props.initial || props.whileInView);
    const once = Boolean((props.viewport as any)?.once);
    const localRef = useReveal(reveal, once);

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!STRIP_PROPS.has(key)) cleaned[key] = value;
    }

    const className = [props.className, reveal ? "athoo-reveal" : ""].filter(Boolean).join(" ");

    cleaned.className = className;
    cleaned.ref = (node: HTMLElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    return React.createElement(tag, cleaned as any);
  });
}

export const motion = {
  div: createMotionTag("div"),
  section: createMotionTag("section"),
  article: createMotionTag("article"),
  ul: createMotionTag("ul"),
  li: createMotionTag("li"),
  span: createMotionTag("span"),
  a: createMotionTag("a"),
  button: createMotionTag("button"),
  h2: createMotionTag("h2"),
  p: createMotionTag("p"),
};

export function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
