import React, { useState, useEffect } from "react";
import { Search, Loader2, PackageOpen, CheckCircle } from "lucide-react";
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
  paymentStatus: string;
  createdAt: string;
}

export default function AdminStoreOrders() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 1. Fetch ALL Orders (Admin View)
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      // Bina email ke call karenge toh sabhi orders aayenge
      const response = await fetch("/api/store/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not connect to database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // 2. Update Order Status (Admin changes status)
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch(`http://localhost:5000/api/store/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Order status changed to ${newStatus}`);
        fetchAllOrders(); // Refresh list to show new status
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Server error while updating.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageOpen className="text-blue-600 h-6 w-6" /> Campus Store Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage student book purchases and update pickup statuses.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Order ID, Student Name, or Book..." 
          className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Order ID & Date</th>
                <th className="px-6 py-4">Student Details</th>
                <th className="px-6 py-4">Book Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <p>Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Col 1: Order ID */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 font-mono">{order.orderId}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>

                    {/* Col 2: Student */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">{order.studentName}</p>
                      <p className="text-xs text-slate-500">{order.studentEmail}</p>
                    </td>

                    {/* Col 3: Book */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800 line-clamp-1">{order.bookTitle}</p>
                      <p className="text-xs font-bold text-green-600 mt-1">Paid: ₹{order.amount}</p>
                    </td>

                    {/* Col 4: Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Collected' ? 'bg-green-100 text-green-700' : 
                        order.status === 'Ready for Pickup' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Col 5: Actions (Admin Controls) */}
                    <td className="px-6 py-4 text-right">
                      {updatingId === order.orderId ? (
                        <Loader2 className="h-5 w-5 animate-spin inline-block text-blue-600" />
                      ) : (
                        <select 
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          disabled={order.status === 'Collected'} // Disable if already collected
                        >
                          <option value="Processing">Processing</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Collected">Collected</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
