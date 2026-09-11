import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Hash,
  User,
  Lock,
  Building,
  KeyRound,
  ArrowLeft,
  MailCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminSignupPage() {
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
    role: "admin",
    designation: "",
    branch: "",
    course: "",
    section: "",
    inviteCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Password & Invite Code visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // =====================================================
  // STEP 1 - SEND OTP
  // =====================================================

  const handleInitialSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/;

    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be 8-16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character."
      );
      return;
    }

    if (!formData.inviteCode.trim()) {
      setError("Admin invite code is required.");
      return;
    }

    setLoading(true);

    try {
      await sendSignupOtp(formData);

      toast.success(`OTP sent to ${formData.email}`);

      setStep(2);
    } catch (err: any) {
      console.error("Signup OTP Error:", err);

      const message = err?.message || "";

      if (message.toLowerCase().includes("invite")) {
        setError("Invalid admin invite code.");
      } else if (
        message.toLowerCase().includes("limit") ||
        message.includes("3")
      ) {
        toast.error(
          "Admin limit full! Redirecting to Student Signup..."
        );

        setTimeout(() => {
          navigate("/signup");
        }, 2000);
      } else {
        setError(
          message ||
            "Failed to send OTP. Check your details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STEP 2 - VERIFY OTP & SIGNUP
  // =====================================================

  const handleOtpVerify = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    setLoading(true);

    try {
      await signup({
        ...formData,
        otp,
      });

      toast.success(
        "Admin Account Created Successfully!"
      );

      navigate("/login");
    } catch (err: any) {
      console.error("Signup Error:", err);

      const message = err?.message || "";

      if (message.toLowerCase().includes("invite")) {
        setError("Invalid admin invite code.");
      } else if (
        message.toLowerCase().includes("limit")
      ) {
        toast.error("Admin limit reached.");

        setTimeout(() => {
          navigate("/signup");
        }, 2000);
      } else {
        setError(
          message ||
            "Invalid or expired OTP. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">

          <div className="h-12 w-12 rounded-xl bg-destructive flex items-center justify-center mb-3 shadow-md">
            <ShieldCheck className="h-6 w-6 text-destructive-foreground" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Admin Registration
          </h1>

          <p className="text-muted-foreground">
            Limited Access (Max 3 Admins)
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6 md:p-8 shadow-sm transition-all duration-300">

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 ? (

            <form
              onSubmit={handleInitialSubmit}
              className="space-y-5 animate-in fade-in slide-in-from-bottom-4"
            >

              {/* BASIC INFORMATION */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* USERNAME */}
                <div className="space-y-2">

                  <Label htmlFor="username">
                    Admin ID (Username)
                  </Label>

                  <div className="relative">

                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="username"
                      className="pl-9"
                      placeholder="admin_01"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />

                  </div>
                </div>

                {/* NAME */}
                <div className="space-y-2">

                  <Label htmlFor="name">
                    Full Name
                  </Label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="name"
                      className="pl-9"
                      placeholder="Library Head"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                  </div>
                </div>

                {/* EMAIL */}
                <div className="space-y-2">

                  <Label htmlFor="email">
                    Official Email
                  </Label>

                  <div className="relative">

                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="email"
                      type="email"
                      className="pl-9"
                      placeholder="admin@library.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>
                </div>

                {/* PHONE */}
                <div className="space-y-2">

                  <Label htmlFor="phone">
                    Phone Number
                  </Label>

                  <div className="relative">

                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="phone"
                      type="tel"
                      className="pl-9"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                  </div>
                </div>

              </div>

              {/* OFFICIAL INFORMATION */}

              <div className="border-t pt-4">

                <p className="text-sm font-semibold text-muted-foreground mb-4">
                  Official Information
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* DESIGNATION */}
                  <div className="space-y-2">

                    <Label htmlFor="designation">
                      Admin Post
                    </Label>

                    <div className="relative">

                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                      <Input
                        id="designation"
                        className="pl-9"
                        placeholder="e.g. Chief Librarian"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                  {/* BRANCH */}
                  <div className="space-y-2">

                    <Label htmlFor="branch">
                      Branch / Department
                    </Label>

                    <div className="relative">

                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                      <Input
                        id="branch"
                        className="pl-9"
                        placeholder="e.g. Central Library"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                      />

                    </div>
                  </div>

                </div>
              </div>

              {/* ADMIN INVITE CODE */}

              <div className="border-t pt-4">

                <div className="space-y-2">

                  <Label htmlFor="inviteCode">
                    Admin Invite Code
                  </Label>

                  <div className="relative">

                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="inviteCode"
                      type={
                        showInviteCode
                          ? "text"
                          : "password"
                      }
                      className="pl-9 pr-10"
                      placeholder="Enter admin invite code"
                      value={formData.inviteCode}
                      onChange={handleChange}
                      required
                    />

                    {/* INVITE CODE EYE */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowInviteCode(
                          !showInviteCode
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label={
                        showInviteCode
                          ? "Hide invite code"
                          : "Show invite code"
                      }
                    >
                      {showInviteCode ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                  <p className="text-xs text-muted-foreground">
                    Enter the invite code provided by the system administrator.
                  </p>

                </div>
              </div>

              {/* PASSWORD */}

              <div className="space-y-2">

                <Label htmlFor="password">
                  Password
                </Label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    className="pl-9 pr-10"
                    placeholder="Secure password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  {/* PASSWORD EYE */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

                <p className="text-xs text-muted-foreground">
                  8-16 characters, uppercase, lowercase,
                  number and special character.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <p className="text-sm text-destructive font-medium text-center">
                  {error}
                </p>
              )}

              {/* CONTINUE */}

              <Button
                type="submit"
                className="w-full text-md py-6"
                variant="destructive"
                disabled={loading}
              >

                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-5 w-5" />
                )}

                {loading
                  ? "Sending OTP..."
                  : "Continue"}

              </Button>

            </form>

          ) : (

            /* =================================================
               STEP 2
            ================================================= */

            <form
              onSubmit={handleOtpVerify}
              className="space-y-6 max-w-sm mx-auto animate-in fade-in slide-in-from-right-8"
            >

              <div className="flex flex-col items-center text-center space-y-3">

                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">

                  <MailCheck className="h-8 w-8 text-destructive" />

                </div>

                <h2 className="text-xl font-bold">
                  Verify Official Email
                </h2>

                <p className="text-sm text-muted-foreground">

                  We've sent a 6-digit OTP to
                  <br />

                  <b className="text-foreground">
                    {formData.email}
                  </b>

                </p>

              </div>

              {/* OTP */}

              <div className="space-y-2">

                <Label
                  htmlFor="otp"
                  className="text-center block"
                >
                  Enter OTP
                </Label>

                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  className="text-center tracking-[0.75em] text-2xl h-14 font-bold border-destructive/20 focus-visible:ring-destructive"
                  required
                />

              </div>

              {/* ERROR */}

              {error && (
                <p className="text-sm text-center text-destructive font-medium bg-destructive/10 p-2 rounded">
                  {error}
                </p>
              )}

              {/* BUTTONS */}

              <div className="space-y-3">

                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full h-12 text-md font-bold shadow-lg"
                  disabled={loading}
                >

                  {loading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}

                  {loading
                    ? "Verifying..."
                    : "Verify & Register Admin"}

                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="w-full text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >

                  <ArrowLeft className="mr-2 h-4 w-4" />

                  Back to details

                </Button>

              </div>

            </form>
          )}

          {/* STUDENT SIGNUP */}

          <div className="mt-6 text-center text-sm border-t pt-4">

            <span className="text-muted-foreground">
              Not an admin?{" "}
            </span>

            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline"
            >
              Student Signup
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}
