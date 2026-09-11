import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  MonitorPlay,
  FileText,
  BrainCircuit,
  ArrowLeft,
  GraduationCap,
  FileQuestion,
  Menu,
  X,
} from "lucide-react";

export default function DigitalLibraryLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-lg"
        : "text-slate-300 hover:bg-slate-800"
    }`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ================= MOBILE HEADER ================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-yellow-400" />
          <span className="font-bold text-base sm:text-lg">
            E-Learning Hub
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed lg:static
          top-0 left-0
          h-full
          w-72 sm:w-80 lg:w-64
          bg-slate-900
          text-white
          flex flex-col
          shadow-xl
          z-50
          transform transition-transform duration-300 ease-in-out
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* Branding */}
        <div className="h-16 flex items-center justify-between gap-3 px-6 border-b border-slate-700 shrink-0">

          <div className="flex items-center gap-3 min-w-0">
            <GraduationCap className="h-6 w-6 text-yellow-400 shrink-0" />

            <span className="font-bold text-lg tracking-wide truncate">
              E-Learning Hub
            </span>
          </div>

          {/* Close button only mobile */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

          <p className="px-2 text-xs font-bold text-slate-500 uppercase mb-3">
            Study Material
          </p>

          {/* Videos */}
          <NavLink
            to="/digital-library/videos"
            onClick={closeSidebar}
            className={navLinkClass}
          >
            <MonitorPlay size={20} className="shrink-0" />
            <span className="font-medium">
              Video Lectures
            </span>
          </NavLink>

          {/* Notes */}
          <NavLink
            to="/digital-library/notes"
            onClick={closeSidebar}
            className={navLinkClass}
          >
            <FileText size={20} className="shrink-0" />
            <span className="font-medium">
              Digital Notes
            </span>
          </NavLink>

          {/* PYQs */}
          <NavLink
            to="/digital-library/pyqs"
            onClick={closeSidebar}
            className={navLinkClass}
          >
            <FileQuestion size={20} className="shrink-0" />
            <span className="font-medium">
              Previous Year Qs
            </span>
          </NavLink>

          {/* Quizzes */}
          <NavLink
            to="/digital-library/quizzes"
            onClick={closeSidebar}
            className={navLinkClass}
          >
            <BrainCircuit size={20} className="shrink-0" />
            <span className="font-medium">
              Quizzes & Mock
            </span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 shrink-0">
          <button
            onClick={() => {
              closeSidebar();
              navigate("/dashboard");
            }}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Library LMS</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main
        className="
          flex-1
          min-w-0
          overflow-auto
          pt-16 lg:pt-0
        "
      >
        <Outlet />
      </main>
    </div>
  );
}