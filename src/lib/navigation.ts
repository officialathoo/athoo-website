export function goToPath(path: string) {
  if (typeof window === "undefined") return;
  window.location.assign(path);
}

export function goToWaitlist() {
  if (typeof window === "undefined") return;

  const scrollToWaitlist = () => {
    const el = document.getElementById("waitlist");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
    return false;
  };

  const isHome = window.location.pathname === "/" || window.location.pathname === "";

  if (isHome && scrollToWaitlist()) {
    if (window.location.hash !== "#waitlist") {
      window.history.replaceState(null, "", "/#waitlist");
    }
    return;
  }

  window.location.assign("/#waitlist");
}
