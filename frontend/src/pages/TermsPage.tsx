import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 animate-fade-in pb-24">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Terms & Conditions</h2>
          <p className="text-muted-foreground text-sm">Please read these terms carefully before using our platform.</p>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> User Agreement & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h3>
            <p>
              By accessing or using the Library Management System (LMS), you agree to comply with and be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must discontinue use of the platform immediately.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. User Accounts & Security</h3>
            <p>
              Users (both Students and Administrators) are entirely responsible for maintaining the confidentiality of their login credentials, passwords, and OTP verifications. You agree to notify us immediately of any unauthorized account activity.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. Book Borrowing and Fines</h3>
            <p>
              Students can request physical books subject to catalog availability and admin approval. Overdue items will accrue late fees as per institutional library policies, which must be cleared to maintain an active, unblocked account status.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. Acceptable Conduct</h3>
            <p>
              You agree not to misuse the platform, hack or attempt unauthorized access to other user profiles, upload malicious scripts, or bypass institutional security frameworks.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}