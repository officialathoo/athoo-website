import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomBar from "./MobileBottomBar";
import WhatsAppButton from "./WhatsAppButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col relative">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomBar />
      <WhatsAppButton />
    </div>
  );
}