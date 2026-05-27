import { Link } from "wouter";

export default function MobileBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-safe pt-3 px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:hidden">
      <div className="flex w-full gap-3 pb-3">
        <button
          onClick={() => {
            const el = document.getElementById("waitlist");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex-1 rounded-full bg-[#0057FF] py-3 text-center text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          Join Waitlist
        </button>
        <Link
          href="/become-provider"
          className="flex-1 rounded-full bg-[#FF8A00] py-3 text-center text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
        >
          Become Provider
        </Link>
      </div>
    </div>
  );
}