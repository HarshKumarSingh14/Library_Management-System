import { useState, useEffect } from "react";
import { Printer, Loader2, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://library-management-system-fdo2.onrender.com/api/transactions/reports/summary");
      if (!res.ok) throw new Error("Failed to fetch reports");
      const result = await res.json();
      setData(result);
    } catch (err) {
      toast.error("Could not load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const issued = data;
  const overdue = data.filter((t) => t.days_overdue > 0);

  const handlePrint = () => window.print();

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-8 animate-fade-in p-2 print:p-0">
      <div className="flex items-center justify-between border-b pb-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="text-primary" /> System Reports
          </h2>
          <p className="text-muted-foreground mt-1">Real-time data of library circulation and penalties.</p>
        </div>
        <Button variant="outline" onClick={handlePrint} className="shadow-sm">
          <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </div>

      {/* Printable Header (Only visible when printing) */}
      <div className="hidden print:block text-center mb-8 border-b-2 pb-4">
        <h1 className="text-4xl font-bold uppercase tracking-widest">Library Management System</h1>
        <p className="text-lg mt-2">Official Circulation & Overdue Report</p>
        <p className="text-sm text-muted-foreground mt-1">Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* All Issued Books Table */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-muted/30 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Active Issues ({issued.length})</h3>
          <span className="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">LIVE DATA</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-muted/50 border-b text-muted-foreground uppercase text-[11px] font-bold">
                <th className="py-4 px-6">Book Title</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Issue Date</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {issued.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/10">
                  <td className="py-4 px-6 font-semibold">{t.book_title}</td>
                  <td className="py-4 px-6 text-muted-foreground">{t.student_name}</td>
                  <td className="py-4 px-6 text-muted-foreground">{new Date(t.issue_date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 font-medium">{new Date(t.due_date).toLocaleDateString()}</td>
                  <td className="py-4 px-6 text-right font-bold">
                    {t.days_overdue > 0 ? (
                      <span className="text-destructive">Overdue (₹{t.fine})</span>
                    ) : (
                      <span className="text-green-600">On Time</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overdue Specific Section */}
      <div className="bg-card rounded-2xl border-2 border-destructive/20 shadow-lg overflow-hidden break-before-page">
        <div className="px-6 py-4 bg-destructive/5 border-b flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-bold text-lg text-destructive">Pending Penalties ({overdue.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-destructive/10 text-destructive-foreground uppercase text-[11px] font-bold">
              <tr>
                <th className="py-4 px-6">Book</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6 text-right">Delay</th>
                <th className="py-4 px-6 text-right">Fine (₹10/day)</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-destructive/5">
                  <td className="py-4 px-6 font-bold">{t.book_title}</td>
                  <td className="py-4 px-6 text-muted-foreground">{t.student_name}</td>
                  <td className="py-4 px-6 text-right font-medium">{t.days_overdue} Days</td>
                  <td className="py-4 px-6 text-right text-destructive font-black">₹{t.fine}</td>
                </tr>
              ))}
              {overdue.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-50" />
                    <p className="font-bold text-green-600">Perfect! No books are currently overdue.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
