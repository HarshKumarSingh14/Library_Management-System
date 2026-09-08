import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom"; 
import { 
  BookOpen, 
  AlertTriangle, 
  ArrowLeftRight, 
  Clock, 
  Loader2, 
  Sparkles, 
  User as UserIcon,
  Calendar,
  Hourglass,   
  CheckCircle2,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import LibraryChatbot from "@/components/LibraryChatbot"; 

interface DashboardStats {
  issuedCount: number;
  pendingCount: number;
  overdueCount: number;
  totalFine: number;
  activeBooks: any[];     
  pendingRequests: any[]; 
}

export function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 🛠️ FIX: Use user?._id because MongoDB uses _id instead of id
  const userId = user?._id || user?.id;

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem("library_token"); 

        const response = await fetch(`https://library-management-system-fdo2.onrender.com/api/dashboard/student/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });

        if (response.status === 401) {
          localStorage.removeItem("library_token");
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [userId, navigate]);

  const handleRedirectToPayment = (bookId: string, amount: number, title: string) => {
    navigate('/payment', { 
      state: { 
        type: 'fine',    
        itemId: bookId,   
        amount: amount, 
        title: title 
      } 
    });
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in duration-500 pb-24"> 

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 rounded-2xl border border-primary/5">
        <div className="flex items-center gap-4">
          
          <Link to="/profile" className="transition-transform hover:scale-105 hover:opacity-90">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm cursor-pointer">
              <AvatarImage src={user?.profile_pic || ""} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || <UserIcon />}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-background/50 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-full text-primary text-sm font-semibold shadow-sm">
          <Sparkles className="h-4 w-4 animate-pulse" />
          System Active
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Books Issued" 
          value={stats?.issuedCount || 0} 
          icon={BookOpen} 
          color="bg-blue-500/10 text-blue-600" 
        />
        <StatCard 
          label="Pending Requests" 
          value={stats?.pendingCount || 0} 
          icon={Hourglass} 
          color="bg-orange-500/10 text-orange-600" 
        />
        <StatCard 
          label="Overdue Alerts" 
          value={stats?.overdueCount || 0} 
          icon={AlertTriangle} 
          color="bg-destructive/10 text-destructive" 
        />
        <StatCard 
          label="Total Fine" 
          value={`₹${stats?.totalFine || 0}`} 
          icon={ArrowLeftRight} 
          color="bg-amber-500/10 text-amber-600" 
        />
      </div>

      {/* SECTION 1: Pending Approvals */}
      {stats?.pendingRequests && stats.pendingRequests.length > 0 && (
        <Card className="shadow-sm border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-orange-700">
              <Hourglass className="h-5 w-5" /> Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingRequests.map((req: any) => (
                <div key={req.id || req._id} className="flex items-center justify-between bg-background p-4 rounded-lg border border-orange-100 shadow-sm">
                  <div>
                    <h4 className="font-semibold text-foreground">{req.title}</h4>
                    <p className="text-xs text-muted-foreground">Requested on: {new Date(req.request_date).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 animate-pulse">
                    Waiting for Admin
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: Active & History Table */}
      <Card className="shadow-lg border-none ring-1 ring-border">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5 text-primary" /> 
            Active Issued book & History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {stats?.activeBooks?.length > 0 ? (
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-4 px-6">Book</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Issued / Due</th>
                    <th className="py-4 px-6 text-right">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.activeBooks.map((book: any) => {
                    const isOverdue = book.due_date && new Date(book.due_date) < new Date() && book.status === 'issued';
                    const fineAmount = Number(book.paid_fine || 0) + Number(book.current_fine || 0);
                    
                    return (
                      <tr key={book.id || book._id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-foreground">{book.title}</div>
                          <div className="text-xs text-muted-foreground">{book.author}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            book.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                            book.status === 'returned' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {book.status === 'issued' && <Clock className="h-3 w-3" />}
                            {book.status === 'returned' && <CheckCircle2 className="h-3 w-3" />}
                            {book.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {book.issue_date ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground">
                                Issued: {new Date(book.issue_date).toLocaleDateString()}
                              </span>
                              {book.due_date && (
                                <span className={`text-xs font-bold ${isOverdue ? "text-red-600" : "text-green-600"}`}>
                                  Due: {new Date(book.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Processing...</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {fineAmount > 0 ? (
                            <div className="flex flex-col items-end gap-2">
                              <span className="font-black text-destructive text-base">₹{fineAmount}</span>
                              <button
                                onClick={() => handleRedirectToPayment(book.id || book.book_id, fineAmount, book.title)}
                                className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm"
                              >
                                <CreditCard className="h-3 w-3" /> Pay Now
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-20">
                <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border shadow-inner">
                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-semibold">No active issued</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  You haven't borrowed any books yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- CHATBOT SECTION --- */}
      <LibraryChatbot studentId={userId} />
      
    </div>
  );
}
