import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function MobileBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/90 backdrop-blur p-3 md:hidden flex items-center justify-between gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <Button variant="outline" asChild className="flex-1 font-semibold">
        <Link href="/#waitlist">Join Waitlist</Link>
      </Button>
      <Button asChild className="flex-1 font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
        <a href="#app-showcase">App Coming Soon</a>
      </Button>
    </div>
  );
}