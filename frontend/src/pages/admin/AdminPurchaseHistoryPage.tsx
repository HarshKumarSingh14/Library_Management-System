import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search, User, Loader2, IndianRupee, History, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Interface matching backend StoreOrders table
interface StoreOrder {
  orderId: string;
  studentName: string;
  studentEmail: string;
  bookTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminPurchaseHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Past Orders
  const fetchAdminHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/store/orders");
      if (!response.ok) throw new Error("Failed to load history");

      const data = await response.json();
      
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

  useEffect(() => {
    fetchAdminHistory();
  }, []);

  // 2. Delete Single Order
  const handleDeleteSingle = async (orderId: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete order ${orderId}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/store/orders/${orderId}`, {
        method: "DELETE"
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Order deleted permanently!");
        fetchAdminHistory(); // Refresh table
      } else {
        toast.error(data.error || "Failed to delete order");
      }
    } catch (error) {
      toast.error("Server error while deleting.");
    }
  };

  // 3. Clear ALL History
  const handleClearAll = async () => {
    if (history.length === 0) {
      toast.info("History is already empty!");
      return;
    }

    const confirmClear = window.confirm("🚨 WARNING: This will permanently delete ALL completed and cancelled orders. Continue?");
    if (!confirmClear) return;

    try {
      const response = await fetch("/api/store/orders/clear-history", {
        method: "DELETE"
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("All purchase history has been cleared!");
        fetchAdminHistory(); // Refresh table (will be empty)
      } else {
        toast.error(data.error || "Failed to clear history");
      }
    } catch (error) {
      toast.error("Server error while clearing history.");
    }
  };

  // Search filter logic
  const filteredPurchases = history.filter(
    (item) =>
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" /> All Student Purchases
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track or clear completed campus store orders.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* 👇 CLEAR ALL BUTTON */}
          <Button 
            variant="destructive" 
            className="w-full sm:w-auto whitespace-nowrap rounded-xl shadow-sm"
            onClick={handleClearAll}
            disabled={history.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Clear All
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-600">Order ID</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Student Details</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Book</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Date</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Amount</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600 text-right">Status & Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Loading historical data...</p>
                  </TableCell>
                </TableRow>
              ) : filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    {searchTerm ? `No purchases found matching "${searchTerm}".` : "No completed purchases yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((item) => (
                  <TableRow key={item.orderId} className="hover:bg-slate-50 transition-colors group">
                    
                    <TableCell className="font-medium text-slate-700 font-mono text-xs">
                      {item.orderId}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{item.studentName}</span>
                          <span className="text-xs text-slate-500">{item.studentEmail}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-slate-800 font-medium">{item.bookTitle}</TableCell>
                    
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    
                    <TableCell className="font-bold text-slate-700">
                      <span className="flex items-center">
                        <IndianRupee className="h-3.5 w-3.5 mr-0.5" />{item.amount}
                      </span>
                    </TableCell>
                    
                    {/* Status & Delete Action */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border">
                          {item.status.toLowerCase() === "collected" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            item.status.toLowerCase() === 'collected' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        {/* 👇 SINGLE DELETE BUTTON */}
                        <button 
                          onClick={() => handleDeleteSingle(item.orderId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
