import Navbar from "@/components/Navbar";
import HeroBattle from "@/components/HeroBattle";
import Footer from "@/components/Footer";
import AdPopup from "@/components/AdPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <AdPopup />
      <Navbar />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <main className="space-y-10 sm:space-y-12 lg:space-y-16">
            <HeroBattle />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
