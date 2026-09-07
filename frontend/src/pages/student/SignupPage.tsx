import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, UserPlus, Mail, Phone, School, Hash, User, Lock, Eye, EyeOff, ArrowLeft, MailCheck, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SignupPage() {
  const { signup, sendSignupOtp } = useAuth(); 
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");
  
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    course: "",
    branch: "",
    year: "", 
    section: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (key: string, value: string) => {
    if (key === "course" && value !== "B.Tech") {
      setFormData({ ...formData, course: value, branch: "" });
    } else {
      setFormData({ ...formData, [key]: value });
    }
  };

  // STEP 1: Details Submit -> Send Real OTP
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Password validation: 8 to 16 characters, combination of uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
    
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    setLoading(true);
    try {
      await sendSignupOtp(formData); 
      
      toast.success(`OTP sent to ${formData.email}`);
      setStep(2); 
    } catch (err: any) {
      console.error("Signup OTP Error:", err);
      setError(err.message || "Failed to send OTP. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP -> Final Signup
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await signup({ ...formData, otp }); 
      
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err: any) {
      console.error("Signup Verification Error:", err);
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-md">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Student Account</h1>
          <p className="text-muted-foreground">Personalize your library experience</p>
        </div>

        <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm transition-all duration-300">
          
          {/* STEP 1: USER DETAILS FORM */}
          {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Roll No / ID)</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" className="pl-9" placeholder="e.g. 21BCS1001" value={formData.username} onChange={handleChange} required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="name" className="pl-9" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">College Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" className="pl-9" placeholder="john@college.edu" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" className="pl-9" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-muted-foreground mb-4">Academic Information (For Library Personalization)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select onValueChange={(val) => handleSelectChange("course", val)} required>
                      <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech">B.Tech</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.course === "B.Tech" && (
                    <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                      <Label htmlFor="branch">Branch</Label>
                      <div className="relative">
                        <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input id="branch" className="pl-9 px-2" placeholder="CS, IT..." value={formData.branch} onChange={handleChange} required />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select onValueChange={(val) => handleSelectChange("year", val)} required>
                      <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Select onValueChange={(val) => handleSelectChange("section", val)} required>
                      <SelectTrigger><SelectValue placeholder="Sec" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    className="pl-9 pr-10"
                    placeholder="8-16 chars (A-Z, a-z, 0-9, special)" 
                    value={formData.password} 
                    onChange={handleChange} 
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

              {error && <p className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded">{error}</p>}

              <Button type="submit" className="w-full text-md py-6 shadow-lg transition-transform hover:scale-[1.01]" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />} 
                {loading ? "Sending OTP..." : "Continue"}
              </Button>
            </form>
          ) : (
            
            /* STEP 2: OTP VERIFICATION FORM */
            <form onSubmit={handleOtpVerify} className="space-y-6 max-w-sm mx-auto animate-in fade-in slide-in-from-right-8">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <MailCheck className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Verify Your Email</h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a 6-digit OTP to <br/><b className="text-foreground">{formData.email}</b>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">Enter OTP</Label>
                <Input 
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="••••••" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center tracking-[0.75em] text-2xl h-14 font-bold"
                  required 
                />
              </div>

              {error && <p className="text-sm text-center text-destructive font-medium bg-destructive/10 p-2 rounded">{error}</p>}

              <div className="space-y-3">
                <Button type="submit" className="w-full h-12 text-md font-bold shadow-lg" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="w-full text-muted-foreground"
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to details
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm border-t pt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}