import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { 
  MonitorPlay, FileText, BrainCircuit, 
  ArrowLeft, GraduationCap, FileQuestion // 1. Added FileQuestion Icon
} from "lucide-react";

export default function DigitalLibraryLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* --- E-LEARNING SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        
        {/* Branding */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
          <GraduationCap className="h-6 w-6 text-yellow-400" />
          <span className="font-bold text-lg tracking-wide">E-Learning Hub</span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <p className="px-2 text-xs font-bold text-slate-500 uppercase mb-2">Study Material</p>
          
          <NavLink 
            to="/digital-library/videos" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <MonitorPlay size={20} />
            <span className="font-medium">Video Lectures</span>
          </NavLink>

          <NavLink 
            to="/digital-library/notes" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <FileText size={20} />
            <span className="font-medium">Digital Notes</span>
          </NavLink>

          {/* --- 2. NEW PYQ LINK ADDED HERE --- */}
          <NavLink 
            to="/digital-library/pyqs" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <FileQuestion size={20} />
            <span className="font-medium">Previous Year Qs</span>
          </NavLink>

          <NavLink 
            to="/digital-library/quizzes" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <BrainCircuit size={20} />
            <span className="font-medium">Quizzes & Mock</span>
          </NavLink>
        </nav>

        {/* Footer: Back to Main LMS */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Library LMS
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-auto">
        {/* Yahan child pages (Videos/Notes) render honge */}
        <Outlet />
      </main>

    </div>
  );
}