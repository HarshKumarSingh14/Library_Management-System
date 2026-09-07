import React, { useState, useEffect } from "react";
import { CheckCircle2, PackageSearch, ArrowLeft, Store, UserCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function TrackOrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL ya navigation se pass kiya gaya order ID
  const orderIdFromState = location.state?.order?.orderId;
  
  const [order, setOrder] = useState<any>(location.state?.order || null);
  const [searchInput, setSearchInput] = useState(orderIdFromState || "");
  const [loading, setLoading] = useState(false);

  // 👇 NAYA LGOIC: Real-time status backend se fetch karne ke liye
  const fetchOrderStatus = async (idToFetch: string) => {
    if (!idToFetch) return;
    setLoading(true);
    try {
      // Humein saare orders milenge, usme se is ID ko dhundenge
      const response = await fetch(`http://localhost:5000/api/store/orders`);
      if (!response.ok) throw new Error("Failed to load status");
      
      const allOrders = await response.json();
      const currentOrder = allOrders.find((o: any) => o.orderId === idToFetch);
      
      if (currentOrder) {
        setOrder(currentOrder);
      } else {
        toast.error("Order not found in database.");
        setOrder(null);
      }
    } catch (error) {
      toast.error("Could not fetch real-time status.");
    } finally {
      setLoading(false);
    }
  };

  // Jab page load ho aur ID ho, toh turant fetch karein
  useEffect(() => {
    if (orderIdFromState) {
      fetchOrderStatus(orderIdFromState);
    }
  }, [orderIdFromState]);

  // Agar user manual search button dabata hai
  const handleTrack = () => {
    if (!searchInput) return toast.error("Please enter an Order ID");
    fetchOrderStatus(searchInput);
  };

  // 1. EMPTY STATE (Agar koi order load nahi hua hai)
  if (!order) {
    return (
      <div className="space-y-6 max-w-md mx-auto mt-10 text-center">
        <PackageSearch className="h-16 w-16 mx-auto text-slate-300" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Track Store Order</h1>
        <p className="text-slate-500">Enter your Order ID to check pickup status.</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="e.g. ORD-123456" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Button onClick={handleTrack} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
          </Button>
        </div>
        <Button variant="link" onClick={() => navigate('/store/orders')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Orders
        </Button>
      </div>
    );
  }

  // --- CAMPUS PICKUP TIMELINE LOGIC ---
  const status = order.status?.toLowerCase() || "processing";
  
  // Status check booleans
  const isPlaced = true; // Hamesha true
  const isReady = status === "ready for pickup" || status === "collected";
  const isCollected = status === "collected";
  const isCancelled = status === "cancelled"; // Naya logic cancelled ke liye
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    });
  };

  // Status Badge Color
  let statusColor = "text-blue-600";
  if (isCollected) statusColor = "text-green-600";
  if (isCancelled) statusColor = "text-red-600";
  if (status === "ready for pickup") statusColor = "text-amber-600";

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/store/orders')} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Campus Pickup Status</h1>
      </div>
      
      {loading && <p className="text-sm text-slate-500 animate-pulse text-center">Syncing with server...</p>}

      <Card className="border-none shadow-md overflow-hidden rounded-2xl">
        <div className="bg-slate-50 border-b p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Order ID (Show this at counter)</p>
            <p className="font-bold text-slate-800 text-xl font-mono bg-white px-3 py-1 border rounded-lg mt-1 inline-block shadow-sm">
              {order.orderId}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-sm font-medium text-slate-500">Current Status</p>
            <p className={`font-bold text-lg uppercase tracking-wide ${statusColor}`}>
              {order.status}
            </p>
          </div>
        </div>

        <CardContent className="p-8">
          
          {/* Agar Cancelled hai toh Timeline ki jagah error dikhaye */}
          {isCancelled ? (
            <div className="text-center py-10 bg-red-50 rounded-xl border border-red-100">
              <div className="h-12 w-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-red-800">Order Cancelled</h3>
              <p className="text-red-600 text-sm mt-1">This order was cancelled by the administrator.</p>
            </div>
          ) : (
            /* Normal Tracking Timeline */
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              
              {/* Step 1: Order Placed */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">Order Processing</div>
                    <time className="text-xs font-bold text-blue-600">{formatDate(order.createdAt)}</time>
                  </div>
                  <div className="text-sm text-slate-500">Your order is confirmed. Admin is preparing your book.</div>
                </div>
              </div>

              {/* Step 2: Ready for Pickup */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors ${isReady ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Store className="h-5 w-5" />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border transition-all ${isReady ? 'border-amber-200 bg-amber-50 shadow-sm' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'}`}>
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className={`font-bold ${isReady ? 'text-amber-800' : 'text-slate-500'}`}>Ready for Pickup</div>
                  </div>
                  <div className={`text-sm ${isReady ? 'text-amber-700/80' : 'text-slate-500'}`}>
                    {isReady 
                      ? "Book is ready! Please collect it from the Campus Bookstore / Library Desk." 
                      : "Waiting for admin to pack your book."}
                  </div>
                </div>
              </div>

              {/* Step 3: Collected */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors ${isCollected ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border transition-all ${isCollected ? 'border-green-100 bg-green-50 shadow-sm' : 'border-dashed border-slate-200 bg-slate-50 opacity-60'}`}>
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className={`font-bold ${isCollected ? 'text-green-800' : 'text-slate-500'}`}>Collected</div>
                  </div>
                  <div className={`text-sm ${isCollected ? 'text-green-600/80' : 'text-slate-500'}`}>
                    {isCollected 
                      ? "You have successfully picked up your book. Happy Reading!" 
                      : "Pending collection by student."}
                  </div>
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}