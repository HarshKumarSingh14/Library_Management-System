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
  AlertCircle,
  QrCode,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function PaymentPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { type, itemId, amount, title } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [upiSubMethod, setUpiSubMethod] = useState<'qr' | 'app'>('qr');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (!type || !amount) {
      navigate(-1);
    }
  }, [type, amount, navigate]);

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      if (!cardNumber || !expiry || !cvv) {
        toast.error("Please fill in your card details.");
        return;
      }
    }

    setStatus('processing');
    
    const apiEndpoint = type === 'book' 
      ? "https://library-management-system-fdo2.onrender.com/api/store/checkout" 
      : "https://library-management-system-fdo2.onrender.com/api/library/pay-fine";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?._id || user?.id || "645a1b2c3d4e5f6789012345", 
          studentName: user?.name || "Student",
          studentEmail: user?.email || "student@gmail.com",
          bookId: itemId, 
          bookTitle: title,
          amount: amount,
          paymentMethod: paymentMethod
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        
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

  const handleAppRedirect = (appName: 'gpay' | 'phonepe') => {
    const upiLink = `upi://pay?pa=librarysystem@oksbi&pn=LibraryManagement&am=${amount}&cu=INR`;
    
    toast.info(`Redirecting to ${appName === 'gpay' ? 'Google Pay' : 'PhonePe'}...`);
    
    window.location.href = upiLink;

    setTimeout(() => {
      handlePayment();
    }, 3000);
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
              
              {/* Order Summary */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    {type === 'fine' ? (
                      <AlertCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Book className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
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

              {/* Payment Methods Selection */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Method</p>
                
                {/* Card Option */}
                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="method" className="hidden" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">Credit / Debit Card (Under Processing Safe)</span>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                      <input 
                        type="text" 
                        placeholder="Card Number (4111 2222 ...)" 
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        maxLength={19}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          maxLength={5}
                        />
                        <input 
                          type="password" 
                          placeholder="CVV" 
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* UPI Option */}
                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="method" className="hidden" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                    <Smartphone className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">UPI Apps / QR Code</span>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setUpiSubMethod('qr')}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${upiSubMethod === 'qr' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                        >
                          <QrCode className="h-4 w-4" /> Pay by QR
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMethod('app')}
                          className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${upiSubMethod === 'app' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                        >
                          <Smartphone className="h-4 w-4" /> GPay / PhonePe
                        </button>
                      </div>

                      {/* Submethod 1: QR Code display */}
                      {upiSubMethod === 'qr' && (
                        <div className="flex flex-col items-center justify-center p-4 bg-background rounded-xl border space-y-2">
                          <div className="bg-white p-2 rounded-lg shadow-sm border">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=librarysystem@oksbi&pn=LibraryManagement&am=${amount}&cu=INR`} 
                              alt="Payment QR Code"
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground text-center">Scan using GPay, PhonePe or Paytm</p>
                          <button
                            type="button"
                            onClick={handlePayment}
                            className="w-full mt-2 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
                          >
                            PAY NOW
                          </button>
                        </div>
                      )}

                      {/* Submethod 2: App Redirect buttons */}
                      {upiSubMethod === 'app' && (
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAppRedirect('gpay')}
                            className="w-full py-2.5 px-4 bg-background border hover:bg-muted/50 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-blue-500"></span> Google Pay (GPay)
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleAppRedirect('phonepe')}
                            className="w-full py-2.5 px-4 bg-background border hover:bg-muted/50 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-purple-500"></span> PhonePe
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </label>
              </div>

              {paymentMethod === 'card' && (
                <button 
                  onClick={handlePayment}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] mt-4"
                >
                  Pay ₹{amount} Securely
                </button>
              )}
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
                  Please do not close this window or press back. Under processing...
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
