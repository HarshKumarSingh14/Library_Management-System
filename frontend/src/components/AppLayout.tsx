import { NavLink as RouterNavLink, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, LayoutDashboard, Search, BookPlus, ArrowLeftRight,
  FileText, LogOut, Library, Menu, X, Users, BellRing,
  MonitorPlay, ShoppingCart, Shield, FileCheck
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- 1. General Links ---
const adminGeneralLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Borrow Requests", icon: BellRing },
  { to: "/books", label: "Manage Books", icon: BookPlus },
  { to: "/students", label: "Students List", icon: Users },
  { to: "/search", label: "Search Books", icon: Search },
  { 
    to: "/store", 
    label: "Book Store", 
    icon: ShoppingCart, 
    newTab: true 
  }, 
  { to: "/transactions", label: "Issue / Return", icon: ArrowLeftRight },
  { to: "/reports", label: "Reports", icon: FileText },
];

const studentGeneralLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/search", label: "Search Books", icon: Search },
  { 
    to: "/store", 
    label: "Buy Books", 
    icon: ShoppingCart, 
    newTab: true 
  }, 
  { to: "/my-history", label: "My History", icon: BookOpen },
];

// --- 2. Digital Links with NEW TAB FLAG ---
const commonDigitalLinks = [
  { 
    to: "/digital-library", 
    label: "Digital Library", 
    icon: MonitorPlay, 
    newTab: true 
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const generalLinks = isAdmin ? adminGeneralLinks : studentGeneralLinks;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // --- RENDER FUNCTION ---
  const renderLinks = (links: any[]) => (
    links.map((link) => {
      if (link.newTab) {
        return (
          <a
            key={link.to}
            href={link.to}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all cursor-pointer"
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </a>
        );
      }

      return (
        <RouterNavLink
          key={link.to}
          to={link.to}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`
          }
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </RouterNavLink>
      );
    })
  );

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Library className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-sidebar-accent-foreground">LibManager</h2>
            <p className="text-[10px] text-sidebar-muted-foreground uppercase font-bold tracking-wider">{user?.role || 'Guest'}</p>
          </div>
          <button className="ml-auto lg:hidden text-sidebar-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderLinks(generalLinks)}

          <div className="py-2">
            <div className="h-px bg-sidebar-border/60 mx-2 my-1" />
            <p className="px-3 text-[10px] font-bold text-sidebar-muted-foreground/70 uppercase tracking-widest mt-2 mb-1">
              E-Learning
            </p>
          </div>

          {renderLinks(commonDigitalLinks)}
        </nav>

        {/* Footer User Profile */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar-accent/10">
          <Link 
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer group"
          >
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm group-hover:border-primary/50 transition-all overflow-hidden">
              <AvatarImage src={user?.profile_pic || ""} alt={user?.name} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold uppercase">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-sidebar-accent-foreground truncate">{user?.name || "Anonymous"}</p>
              <p className="text-[10px] text-sidebar-muted-foreground truncate uppercase font-medium">My Account</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-sidebar-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <header className="sticky top-0 z-30 h-14 border-b bg-card/80 backdrop-blur flex items-center px-4 lg:px-6">
          <button className="lg:hidden mr-3 text-muted-foreground p-1 hover:bg-accent rounded-md" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest hidden sm:inline">LMS</span>
            <span className="h-4 w-px bg-border hidden sm:inline" />
            <h1 className="text-sm font-bold text-foreground capitalize">
              {user?.role} Portal
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* 👇 Added Footer Section with Terms & Privacy Links */}
        <footer className="w-xl border-t bg-card py-6 px-6 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
            
            <div className="flex items-center gap-6 font-medium">
              <Link to="/terms" className="flex items-center gap-1 hover:text-primary transition-colors">
                <FileCheck className="h-3.5 w-3.5" /> Terms & Conditions
              </Link>
              <Link to="/privacy" className="flex items-center gap-1 hover:text-primary transition-colors">
                <Shield className="h-3.5 w-3.5" /> Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}