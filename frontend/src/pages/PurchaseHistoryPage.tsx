import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, IndianRupee } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Interface matching backend StoreOrders table
interface StoreOrder {
  orderId: string;
  bookTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function PurchaseHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email) return;

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/store/orders?email=${user.email}`);
        if (!response.ok) throw new Error("Failed to load history");

        const data = await response.json();
        
        // 👇 SIRF PAST ORDERS: Sirf 'Collected' aur 'Cancelled' filter kar rahe hain
        const pastOrders = data.filter((order: StoreOrder) => 
          order.status.toLowerCase() === "collected" || 
          order.status.toLowerCase() === "cancelled"
        );
        
        setHistory(pastOrders);
      } catch (error) {
        console.error(error);
        toast.error("Could not fetch purchase history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-800">Purchase History</h1>
      <p className="text-sm text-slate-500 -mt-4 mb-4">View your successfully collected and cancelled campus store books.</p>
      
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="py-4 font-semibold text-slate-700">Order Ref</TableHead>
              <TableHead className="py-4 font-semibold text-slate-700">Book Details</TableHead>
              <TableHead className="py-4 font-semibold text-slate-700">Date</TableHead>
              <TableHead className="py-4 font-semibold text-slate-700">Amount</TableHead>
              <TableHead className="py-4 font-semibold text-slate-700 text-right">Final Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Loading history...</p>
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No past purchase history found.
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.orderId} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-600 font-mono text-xs">
                    {item.orderId}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    {item.bookTitle}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    <span className="flex items-center">
                      <IndianRupee className="h-3.5 w-3.5 mr-0.5" />{item.amount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* 👇 'Delivered' ko badal kar 'Collected' kar diya hai */}
                      {item.status.toLowerCase() === "collected" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm font-bold uppercase tracking-wider ${
                        item.status.toLowerCase() === 'collected' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}