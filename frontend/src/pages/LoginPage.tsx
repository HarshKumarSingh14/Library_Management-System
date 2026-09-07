import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/lms";
import { BookOpen, LogIn, User, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!auth || !auth.login) {
        console.error("Auth context is missing!");
        setError("System error: Auth context missing.");
        setIsLoading(false);
        return;
    }

    try {
      await auth.login(identifier, password, role);
      
      toast.success(`Welcome back, ${role}!`);
      
      const destination = role === 'admin' ? '/dashboard' : '/dashboard';
      navigate(destination);
      
    } catch (err: any) {
      console.error("Login Error:", err);
      const errorMessage = err?.message || "Invalid credentials";

      if (errorMessage.toLowerCase().includes("not found")) {
        const dest = role === "student" ? "/signup" : "/admin-signup";
        const msg = role === "student" ? "Student account" : "Admin account";
        
        setError(`${msg} not found. Redirecting...`);
        toast.error(`${msg} does not exist!`);
        
        setTimeout(() => navigate(dest), 1500);
      } else {
        setError("Invalid Username/Email or Password");
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center mb-4 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
            <BookOpen className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter">Library Manager</h1>
          <p className="text-muted-foreground mt-2 font-medium">Digital Hub for Knowledge</p>
        </div>

        <div className="bg-card rounded-2xl border-2 border-primary/10 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Switcher */}
            <div className="p-1.5 bg-muted rounded-xl flex mb-6 border shadow-inner">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                  role === "student" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                  role === "admin" ? "bg-background text-destructive shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Librarian
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-bold uppercase text-muted-foreground">Identity</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="identifier"
                    className="pl-10 h-12 bg-muted/20 border-2 focus-visible:ring-primary"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={role === "admin" ? "Admin ID or Email" : "Registration ID or Email"}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 h-12 bg-muted/20 border-2 focus-visible:ring-primary" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Secure Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {/* <-- Added Forgot Password Link Here --> */}
                <div className="flex justify-end mt-1">
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
            </div>

            {/* Visual Error Feed */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                <span className="h-2 w-2 bg-destructive rounded-full animate-ping" />
                <p className="text-xs text-destructive font-bold">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full h-12 text-md font-bold shadow-lg transition-all active:scale-95 ${
                role === 'admin' ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
              }`} 
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
              ) : (
                <><LogIn className="mr-2 h-4 w-4" /> Secure Sign In</>
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t text-center space-y-3">
            <p className="text-xs text-muted-foreground font-medium">
              Don't have an account yet?
            </p>
            {role === 'student' ? (
              <Link to="/signup" className="inline-block text-sm font-black text-primary hover:brightness-125 transition-all">
                JOIN AS STUDENT →
              </Link>
            ) : (
              <Link to="/admin-signup" className="inline-block text-sm font-black text-destructive hover:brightness-125 transition-all">
                REGISTER AS ADMIN →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}