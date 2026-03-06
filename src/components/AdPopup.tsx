import { useState } from "react";
import { X } from "lucide-react";

const AdPopup = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="flex flex-col items-end max-w-sm w-full">
        {/* Skip Button - above the ad */}
        <button
          onClick={() => setVisible(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 mb-2 rounded-full text-xs font-bold shadow-lg bg-white text-slate-800 hover:bg-slate-100 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          <span>Skip</span>
        </button>

        {/* Ad Image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="/wantedsoft.png"
            alt="Advertisement"
            className="w-full h-auto block"
          />
        </div>
      </div>
    </div>
  );
};

export default AdPopup;
