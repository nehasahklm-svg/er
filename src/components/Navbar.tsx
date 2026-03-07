import { useState, useEffect } from "react";
import { Vote, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = async () => {
    const shareText = `🚨 LIVE Election Counting Results 🗳️
Track real-time updates.

🌐 https://www.kpvsbalen.tech/

⚡ Fast • Accurate • Live Updates
🚀 Developed by Wanted Soft`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copied!",
        description: "Share message copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand - Left */}
          <div className="flex items-center gap-3">
            <Link to="/">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#084b92' }}>
                  <Vote className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  location.pathname === '/' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                गृहपृष्ठ
              </Link>
              <Link 
                to="/proportional" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  location.pathname === '/proportional' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                समानुपातिक
              </Link>
              <Link 
                to="/candidates" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  location.pathname === '/candidates' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                उम्मेदवार
              </Link>
            </div>
          </div>

          {/* Center Title */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <h1 className="font-bold text-sm sm:text-xl text-slate-900 tracking-tight leading-none flex items-center gap-2 justify-center">
              <span className="text-lg sm:text-2xl">🇳🇵</span>
              Election Results 2082
            </h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 hidden xs:block sm:block">Real-time Coverage</p>
          </div>

          {/* Live Status & Stats - Right */}
          <div className="flex items-center gap-4">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Live Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="absolute w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Live
                </span>
              </div>
              
              {/* Time */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Time
                </span>
                <span className="text-sm font-mono font-bold text-slate-900">
                  {time.toLocaleTimeString("en-US", { 
                    hour: "2-digit", 
                    minute: "2-digit", 
                    second: "2-digit",
                    hour12: true 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
