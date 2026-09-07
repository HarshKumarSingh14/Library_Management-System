import { useState, useEffect } from "react";
import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Request {
  id: number;
  user_name: string;
  book_title: string;
  request_date: string;
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending requests
  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions/pending");
      const data = await res.json();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const res = await fetch(`http://localhost:5000/api/transactions/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id }),
      });

      if (res.ok) {
        toast.success(`Request ${action}ed successfully!`);
        setRequests(prev => prev.filter(r => r.id !== id)); // List se hatayein
      }
    } catch (err) {
      toast.error("Process failed");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Borrowing Requests</h2>
      
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted uppercase text-xs">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Book Title</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-accent/50 transition-colors">
                <td className="p-4 font-medium">{req.user_name}</td>
                <td className="p-4">{req.book_title}</td>
                <td className="p-4 text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(req.request_date).toLocaleDateString()}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleAction(req.id, 'approve')}
                  >
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleAction(req.id, 'reject')}
                  >
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && !loading && (
          <div className="p-10 text-center text-muted-foreground">No pending requests!</div>
        )}
      </div>
    </div>
  );
}