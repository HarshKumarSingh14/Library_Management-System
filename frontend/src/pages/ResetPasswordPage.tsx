import { useState } from "react";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Get token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    // Strict password validation (8-16 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return toast.error("Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://library-management-system-fdo2.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }
      
      setIsSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err: any) {
      console.error("Reset Password Error:", err);
      toast.error(err.message || "Invalid or expired token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-destructive/10 p-6 rounded-xl border border-destructive text-center">
          <h2 className="text-xl font-bold text-destructive">Invalid Reset Link</h2>
          <p className="text-muted-foreground mt-2">Token is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border p-8 shadow-xl">
        {isSuccess ? (
          <div className="text-center space-y-4 animate-fade-in">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-black">Password Updated!</h2>
            <p className="text-muted-foreground">Your password has been successfully reset.</p>
            <Button onClick={() => navigate("/login")} className="w-full mt-4 font-bold">
              Go to Login
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black">Create New Password</h2>
              <p className="text-sm text-muted-foreground mt-2">Please enter your new secure password below.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="8-16 chars (A-Z, a-z, 0-9, special)" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 pr-10" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must be 8-16 characters with uppercase, lowercase, number, and special character.</p>
              </div>
              
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm New Password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="pl-10 pr-10" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full h-12 font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Update Password"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
