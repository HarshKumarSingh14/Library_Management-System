import { NavLink, Outlet, Link } from "react-router-dom";
import { 
  ShoppingBag, Truck, History, BookCopy, 
  ArrowLeft, Users, Store
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// --- STUDENT LINKS ---
const studentStoreLinks = [
  { to: "/store", label: "Campus Store", icon: Store, end: true },
  { to: "/store/orders", label: "My Pickups", icon: ShoppingBag },
  { to: "/store/track", label: "Track Pickup", icon: Truck },
  { to: "/store/history", label: "Purchase History", icon: History },
];

// --- ADMIN LINKS ---
const adminStoreLinks = [
  { to: "/store", label: "Manage Inventory", icon: BookCopy, end: true },
  { to: "/store/orders", label: "Manage Pickups", icon: Users },
  { to: "/store/history", label: "Purchase History", icon: History }, // 👈 Added Here
];

export default function BookStoreLayout({ children }: { children?: React.ReactNode }) {
  const { user, isAdmin } = useAuth(); 

  const activeLinks = isAdmin ? adminStoreLinks : studentStoreLinks;

  return (
    <div className="min-h-screen flex w-full bg-slate-50/50">
      {/* Sidebar */}
      <aside className="fixed sticky top-0 left-0 h-screen w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight text-slate-800">
              {isAdmin ? "Store Admin" : "Campus Store"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            University Marketplace
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {activeLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
          
          <div className="pt-4 mt-4 border-t">
             <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to LMS
             </Link>
          </div>
        </nav>

        {/* User Profile Section at Bottom */}
        <div className="p-4 border-t bg-slate-50">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-wider">
                {isAdmin ? "Admin Account" : "Student Account"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            {isAdmin ? "Store Management Dashboard" : "Campus Marketplace"}
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-500">System Online</span>
          </div>
        </header>
        
        <main className="p-8 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}