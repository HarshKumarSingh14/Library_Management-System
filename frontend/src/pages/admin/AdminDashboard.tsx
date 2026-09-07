import { useEffect, useState } from "react";
import { BookOpen, Users, ArrowLeftRight, AlertTriangle, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${color}`}>
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("library_token");
        const response = await fetch(`http://localhost:5000/api/dashboard/admin`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          }
        });
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Admin Dashboard error:", error);
        toast.error("Could not load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium animate-pulse">Syncing Library Data...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in p-2 max-w-7xl mx-auto pb-24">
      {/* Title Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-black tracking-tighter text-foreground">Command Center</h2>
        <p className="text-muted-foreground text-lg">Global overview of library assets and activity.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Catalog Size" value={stats?.totalBooks || 0} icon={BookOpen} color="bg-blue-100 text-blue-700" />
        <StatCard label="Total Students" value={stats?.totalStudents || 0} icon={Users} color="bg-purple-100 text-purple-700" />
        <StatCard label="On Loan" value={stats?.activeIssues || 0} icon={ArrowLeftRight} color="bg-orange-100 text-orange-700" />
        <StatCard label="Pending Requests" value={stats?.pendingRequests || 0} icon={AlertTriangle} color="bg-red-100 text-red-700" />
      </div>

      {/* Recent Activity Table */}
      <Card className="shadow-lg border-none bg-card/50 backdrop-blur">
        <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
            Recent Activity Log
          </CardTitle>
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Live Feed
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-4 px-6">Book Title</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions?.map((t: any) => {
                  const displayDate = t.issue_date ? t.issue_date : t.request_date;
                  
                  return (
                    <tr key={t.id || t._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-foreground">{t.book_title}</td>
                      <td className="py-4 px-6 text-muted-foreground font-medium">{t.student_name}</td>
                      
                      {/* Date Column */}
                      <td className="py-4 px-6 text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{displayDate ? new Date(displayDate).toLocaleDateString() : 'N/A'}</span>
                          <span className="text-[10px] opacity-70">
                            {t.issue_date ? 'Issued On' : 'Requested On'}
                          </span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6 text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          t.status === 'returned' ? "bg-green-100 text-green-700 border-green-200" :
                          t.status === 'issued' ? "bg-blue-100 text-blue-700 border-blue-200" :
                          t.status === 'rejected' ? "bg-red-100 text-red-700 border-red-200" :
                          "bg-orange-100 text-orange-700 border-orange-200" // Pending
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
            <div className="p-12 text-center text-muted-foreground italic">
              No recent activity recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}