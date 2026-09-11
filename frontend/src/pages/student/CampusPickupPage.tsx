import React, { useState, useEffect } from "react";
import { BookOpen, Clock, Loader2, IndianRupee, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom"; 

// Interface matching backend StoreOrders table
interface StoreOrder {
  orderId: string;
  bookTitle: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function CampusPickupsPage() {
  const { user } = useAuth(); 
  const navigate = useNavigate(); 
  
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from backend
  const fetchMyOrders = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/store/orders?email=${user.email}`);
      
      if (!response.ok) throw new Error("Failed to load records");
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch your pickup history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]); 

  // College-friendly Status Colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "collected":
        return "bg-green-100 text-green-700 border-green-200";
      case "ready for pickup":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "processing":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">My Campus Pickups</h1>
          <p className="text-sm text-slate-500 mt-1">Track books you've purchased from the campus store.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-xl border border-dashed">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p>Fetching your campus records...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <Store className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">You haven't purchased any books yet.</p>
            <Button 
              variant="link" 
              className="mt-2 text-blue-600"
              onClick={() => navigate('/store')} 
            >
              Browse Campus Store
            </Button>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.orderId} className="hover:shadow-md transition-shadow border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-slate-50/50 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-3 text-slate-800">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="line-clamp-1">{order.bookTitle}</span>
                    <span className="text-xs font-normal text-slate-500 font-mono mt-0.5">Ref: {order.orderId}</span>
                  </div>
                </CardTitle>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-700 flex items-center justify-end">
                    <IndianRupee className="h-4 w-4 mr-0.5" />{order.amount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider">
                    Paid Online
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" /> 
                    Requested on <span className="font-medium text-slate-700">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full border uppercase tracking-wide ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    
                    {/* 👇 YAHAN CHANGE KIYA HAI: Agar status Collected ho gaya, toh Check Status button hide ho jayega */}
                    {order.status.toLowerCase() !== 'collected' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto sm:ml-0 shadow-sm rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => navigate('/store/track', { state: { order: order } })}
                      >
                        Check Status
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
