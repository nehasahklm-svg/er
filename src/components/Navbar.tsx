import { useState, useEffect } from "react";
import { Vote } from "lucide-react";

const Navbar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand - Left */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#084b92' }}>
                <Vote className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          </div>

          {/* Center Title */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
            <h1 className="font-bold text-sm sm:text-xl text-slate-900 tracking-tight leading-none">
              Election Results 2082
            </h1>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 hidden xs:block sm:block">Real-time Coverage</p>
          </div>

          {/* Live Status & Stats - Right */}
          <div className="flex items-center gap-4">
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
