import { handlePathClick, handleWaitlistClick } from "@/lib/navigation";

export default function MobileBottomBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[2147483647] border-t border-gray-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-10px_20px_rgba(0,0,0,0.08)] md:hidden"
      style={{ pointerEvents: "auto", WebkitTransform: "translateZ(0)", transform: "translateZ(0)" }}
    >
      <div className="flex w-full gap-3" style={{ pointerEvents: "auto" }}>
        <a
          href="/#waitlist"
          onClick={(event) => handleWaitlistClick(event)}
          className="relative z-[2147483647] flex-1 touch-manipulation select-none rounded-full bg-[#0057FF] py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95"
          style={{ pointerEvents: "auto", WebkitTapHighlightColor: "transparent" }}
          aria-label="Join Athoo waitlist"
        >
          Join Waitlist
        </a>
        <a
          href="/become-provider"
          onClick={(event) => handlePathClick("/become-provider", event)}
          className="relative z-[2147483647] flex-1 touch-manipulation select-none rounded-full bg-[#FF8A00] py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95"
          style={{ pointerEvents: "auto", WebkitTapHighlightColor: "transparent" }}
          aria-label="Become an Athoo provider"
        >
          Become Provider
        </a>
      </div>
    </div>
  );
}
