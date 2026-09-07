import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, 
  Book, 
  History, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  CreditCard 
} from "lucide-react";
import { toast } from "sonner";

export default function MyHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/transactions/student/${user.id}`);
        
        if (!res.ok) throw new Error("Failed to load history");
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setHistory(data);
        } else {
          setHistory([]);
        }

      } catch (err) {
        toast.error("Could not fetch your borrowing history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.id]);

  // Redirect to the newly created payment page
  const handleRedirectToPayment = (transactionId: string, amount: number, title: string) => {
    navigate('/payment', { 
      state: { bookId: transactionId, amount, title } 
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Fetching your records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-4 pb-24">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Borrowing History</h2>
          <p className="text-muted-foreground">All your requests and issued books</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground uppercase text-[11px] tracking-wider font-bold">
                <th className="py-4 px-6">Book Title</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Requested On</th>
                <th className="py-4 px-6">Issued / Due</th>
                <th className="py-4 px-6 text-right">Fine / Dues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((t) => {
                // Ensure correct math if there are current/paid fines returned by backend
                const fineAmount = Number(t.fine_amount || t.current_fine || 0);

                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    
                    {/* Book Title */}
                    <td className="py-4 px-6 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        {t.title}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        t.status === "returned" ? "bg-green-50 text-green-700 border-green-200" :
                        t.status === "issued" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        t.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-orange-50 text-orange-700 border-orange-200"
                      }`}>
                        {t.status === "pending" && <Clock className="h-3 w-3" />}
                        {t.status === "issued" && <Loader2 className="h-3 w-3 animate-spin" />}
                        {t.status === "returned" && <CheckCircle2 className="h-3 w-3" />}
                        {t.status === "rejected" && <XCircle className="h-3 w-3" />}
                        {t.status}
                      </span>
                    </td>

                    {/* Requested Date */}
                    <td className="py-4 px-6 text-muted-foreground">
                      {t.request_date ? new Date(t.request_date).toLocaleDateString() : "N/A"}
                    </td>

                    {/* Dates Logic */}
                    <td className="py-4 px-6 text-muted-foreground">
                      {t.status === 'pending' ? (
                        <span className="text-xs italic text-muted-foreground/60">Waiting for approval</span>
                      ) : t.status === 'rejected' ? (
                        <span className="text-xs italic text-red-400">Request Denied</span>
                      ) : (
                        <div className="flex flex-col text-xs">
                          {t.issue_date && <span>Issued: {new Date(t.issue_date).toLocaleDateString()}</span>}
                          {t.return_date || t.due_date ? (
                            <span className={t.return_date ? "text-green-600" : "text-blue-600 font-medium"}>
                              {t.return_date 
                                ? `Ret: ${new Date(t.return_date).toLocaleDateString()}` 
                                : `Due: ${new Date(t.due_date).toLocaleDateString()}`
                              }
                            </span>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Fine Column */}
                    <td className="py-4 px-6 text-right">
                      {fineAmount > 0 ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-destructive text-sm">₹{fineAmount}</span>
                          
                          {/* Show Pay Now button if fine exists and status isn't pending/rejected */}
                          {(t.status === 'issued' || t.status === 'returned') && (
                            <button
                              onClick={() => handleRedirectToPayment(t.id, fineAmount, t.title)}
                              className="flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs px-3 py-1.5 rounded-md transition-colors font-semibold shadow-sm"
                            >
                              <CreditCard className="h-3 w-3" /> Pay
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-muted-foreground opacity-40" />
            </div>
            <p className="text-muted-foreground font-medium">No borrowing history found.</p>
            <button 
                onClick={() => navigate('/search')} // Fixed Client-Side Routing
                className="text-primary text-sm font-bold hover:underline"
            >
                Browse catalog to borrow your first book
            </button>
          </div>
        )}
      </div>
    </div>
  );
}