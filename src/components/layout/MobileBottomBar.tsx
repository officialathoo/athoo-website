import { goToPath, goToWaitlist } from "@/lib/navigation";

export default function MobileBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] border-t border-gray-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:hidden pointer-events-auto">
      <div className="flex w-full gap-3">
        <button
          type="button"
          onClick={goToWaitlist}
          onTouchEnd={(event) => {
            event.preventDefault();
            goToWaitlist();
          }}
          className="relative z-[10000] flex-1 touch-manipulation rounded-full bg-[#0057FF] py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95 pointer-events-auto"
          aria-label="Join Athoo waitlist"
        >
          Join Waitlist
        </button>
        <button
          type="button"
          onClick={() => goToPath("/become-provider")}
          onTouchEnd={(event) => {
            event.preventDefault();
            goToPath("/become-provider");
          }}
          className="relative z-[10000] flex-1 touch-manipulation rounded-full bg-[#FF8A00] py-3 text-center text-sm font-bold text-white shadow-md transition-transform active:scale-95 pointer-events-auto"
          aria-label="Become an Athoo provider"
        >
          Become Provider
        </button>
      </div>
    </div>
  );
}
