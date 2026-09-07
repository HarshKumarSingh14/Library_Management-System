import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ShieldAlert } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 animate-fade-in pb-24">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h2>
          <p className="text-muted-foreground text-sm">How we collect, use, and protect your personal data.</p>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Data Protection & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. Information We Collect</h3>
            <p>
              During registration and profile management, we collect personal information such as your full name, username, institutional email, phone number, academic branch, course, and year to keep track of library circulation records.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. Usage of Information</h3>
            <p>
              Your data is utilized strictly for institutional library administration, processing book loans, calculating overdue fines, sending verification OTP emails, and providing digital e-learning assets.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. Cloud Media Storage</h3>
            <p>
              Profile pictures uploaded by users are securely hosted through our cloud infrastructure partner (Cloudinary) and linked directly to your database record.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. Data Security Protocols</h3>
            <p>
              We implement industry-standard encryption measures, including password hashing via Bcrypt, JSON Web Tokens (JWT), and secure SMTP mail transporters to safeguard your sensitive data from unauthorized exposure.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}