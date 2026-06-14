import { useRef } from "react";
import { goToProvider, goToWaitlist } from "@/lib/navigation";

type ButtonAction = "waitlist" | "provider";

export default function MobileBottomBar() {
  const lastTapRef = useRef(0);

  const runAction = (
    event:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>
      | React.PointerEvent<HTMLButtonElement>,
    action: ButtonAction,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const now = Date.now();
    if (now - lastTapRef.current < 220) return;
    lastTapRef.current = now;

    if (action === "waitlist") {
      goToWaitlist();
      return;
    }

    goToProvider();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[2147483647] border-t border-gray-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] md:hidden"
      style={{ pointerEvents: "auto", WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}
    >
      <div className="flex w-full gap-3" style={{ pointerEvents: "auto" }}>
        <button
          type="button"
          onPointerUp={(event) => runAction(event, "waitlist")}
          onTouchEnd={(event) => runAction(event, "waitlist")}
          onClick={(event) => runAction(event, "waitlist")}
          className="relative z-[2147483647] flex-1 touch-manipulation select-none rounded-full bg-[#0057FF] py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95"
          style={{ pointerEvents: "auto", WebkitTapHighlightColor: "transparent" }}
          aria-label="Join Athoo waitlist"
        >
          Join Waitlist
        </button>

        <button
          type="button"
          onPointerUp={(event) => runAction(event, "provider")}
          onTouchEnd={(event) => runAction(event, "provider")}
          onClick={(event) => runAction(event, "provider")}
          className="relative z-[2147483647] flex-1 touch-manipulation select-none rounded-full bg-[#FF8A00] py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95"
          style={{ pointerEvents: "auto", WebkitTapHighlightColor: "transparent" }}
          aria-label="Become an Athoo provider"
        >
          Become Provider
        </button>
      </div>
    </div>
  );
}
