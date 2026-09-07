import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  Loader2, 
  ShieldCheck, 
  Book,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Ensure you have this
import { toast } from "sonner"; // Ensure you have this

export default function PaymentPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dashboard ya Store se aane wala dynamic data catch karna
  // type: 'fine' ya 'book' hoga
  const { type, itemId, amount, title } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // Agar user directly URL type karke aata hai bina data ke, toh wapas bhej do
  useEffect(() => {
    if (!type || !amount) {
      navigate(-1); // Go back to wherever they came from
    }
  }, [type, amount, navigate]);

  const handlePayment = async () => {
    setStatus('processing');
    
    // Dynamic API Endpoint based on payment type
    const apiEndpoint = type === 'book' 
      ? "http://localhost:5000/api/store/checkout" 
      : "http://localhost:5000/api/library/pay-fine";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id || 1, 
          itemId: itemId, // yeh bookId ya fineId hoga
          title: title,
          amount: amount,
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        
        // Success hone ke baad thodi der ruk kar sahi jagah wapas bhejo
        setTimeout(() => {
          if (type === 'book') navigate('/store', { replace: true });
          if (type === 'fine') navigate('/dashboard', { replace: true });
        }, 2000);

      } else {
        setStatus('idle');
        toast.error(data.error || "Payment failed at gateway.");
      }
    } catch (error) {
      setStatus('idle');
      toast.error("Could not connect to payment server.");
    }
  };

  if (!amount) return null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      
      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={status !== 'idle'}
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>

      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-background p-6 flex flex-col items-center justify-center border-b text-center space-y-2">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Secure Checkout</h2>
          <p className="text-sm text-muted-foreground">Complete your payment securely.</p>
        </div>

        {/* Dynamic Body Based on Status */}
        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-6">
              
              {/* Dynamic Order Summary */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    {/* Icon changes based on type */}
                    {type === 'fine' ? (
                      <AlertCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Book className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    {/* Title changes based on type */}
                    <p className="text-sm font-medium">
                      {type === 'fine' ? 'Library Fine' : 'Book Purchase'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">₹{amount}</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Method</p>
                
                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <input type="radio" name="method" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">Credit / Debit Card</span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <input type="radio" name="method" className="hidden" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                  <Smartphone className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">UPI (GPay, PhonePe)</span>
                </label>
              </div>

              <button 
                onClick={handlePayment}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] mt-4"
              >
                Pay ₹{amount} Securely
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
              <div className="relative">
                <Loader2 className="h-20 w-20 text-primary animate-spin" />
                <ShieldCheck className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Processing Payment</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Please do not close this window or press back.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="py-16 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 animate-in zoom-in duration-500 delay-150" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
              
              {/* Dynamic Success Message */}
              <p className="text-muted-foreground text-center">
                {type === 'fine' 
                  ? `Your fine of ₹${amount} has been cleared.` 
                  : `Your order for "${title}" is placed.`}
              </p>
              
              <p className="text-xs text-muted-foreground animate-pulse mt-8">
                Redirecting...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}