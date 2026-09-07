import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import { Loader2 } from "lucide-react";

// --- MAIN PAGES (LMS) ---
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/student/SignupPage";
import AdminSignupPage from "@/pages/admin/AdminSignupPage";
import AdminDashboard from "@/pages/admin/AdminDashboard"; 
import StudentDashboard from "@/pages/student/StudentDashboard";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import SearchPage from "@/pages/SearchPage";
import TransactionsPage from "@/pages/TransactionsPage";
import ReportsPage from "@/pages/ReportsPage";
import MyHistoryPage from "@/pages/student/MyHistoryPage";
import ProfilePage from "@/pages/ProfilePage";
import StudentsListPage from "@/pages/admin/StudentListPage";
import NotFound from "./pages/NotFound";
import BorrowRequestsPage from "@/pages/admin/AdminRequests";
import BooksPage from "@/pages/admin/BooksPage"; 
import PaymentPage from "@/pages/PaymentPage";

// --- LEGAL PAGES ---
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";

// --- E-LEARNING IMPORTS ---
import DigitalLibraryLayout from "./layouts/DigitalLibraryLayout";
import ResourcePage from "./pages/ResourcePage";

// --- BOOKSTORE IMPORTS ---
import BookStoreLayout from "./layouts/BookStoreLayout"; 
import OrdersPage from "@/pages/student/OrdersPage"; 
import TrackOrdersPage from "@/pages/TrackOrdersPage";
import PurchaseHistoryPage from "@/pages/PurchaseHistoryPage";
import AdminPurchaseHistoryPage from "@/pages/admin/AdminPurchaseHistoryPage"; 
import StudentStorePage from "@/pages/student/StudentStorePage"; 
import BookStore from "@/pages/BookStore"; 
import AdminStoreOrders from "@/pages/admin/AdminStoreOrders"; 

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isAdmin, isLoading } = useAuth();

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse tracking-tight">
          Verifying session...
        </p>
      </div>
    );
  }

  // 2. PUBLIC ROUTES
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-signup" element={<AdminSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 3. PROTECTED ROUTES
  return (
    <Routes>
      
      {/* --- SECTION A: DIGITAL LIBRARY --- */}
      <Route path="/digital-library" element={<DigitalLibraryLayout />}>
        <Route index element={<Navigate to="videos" replace />} />
        <Route path="videos" element={<ResourcePage pageType="video" />} />
        <Route path="notes" element={<ResourcePage pageType="note" />} />
        <Route path="pyqs" element={<ResourcePage pageType="pyq" />} />
        <Route path="quizzes" element={<ResourcePage pageType="quiz" />} />
      </Route>

      {/* --- SECTION B: STORE ROUTE (E-COMMERCE / CAMPUS STORE) --- */}
      <Route path="/store" element={<BookStoreLayout />}>
        <Route index element={isAdmin ? <BookStore /> : <StudentStorePage />} /> 
        <Route path="orders" element={isAdmin ? <AdminStoreOrders /> : <OrdersPage />} />
        <Route path="track" element={<TrackOrdersPage />} />
        <Route path="history" element={isAdmin ? <AdminPurchaseHistoryPage /> : <PurchaseHistoryPage />} />
      </Route>

      {/* --- SECTION C: MAIN LMS (PHYSICAL LIBRARY) --- */}
      <Route path="/*" element={
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route 
              path="/dashboard" 
              element={isAdmin ? <AdminDashboard /> : <StudentDashboard />} 
            />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Admin Routes */}
            {isAdmin && (
              <>
                <Route path="/books" element={<BooksPage />} /> 
                <Route path="/admin/requests" element={<BorrowRequestsPage />} /> 
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/students" element={<StudentsListPage />} />
              </>
            )}

            {/* Student Routes */}
            {!isAdmin && (
              <>
                <Route path="/my-history" element={<MyHistoryPage />} />
                <Route path="/payment" element={<PaymentPage />} />
              </>
            )}

            {/* Legal Pages (Accessible to all logged-in users inside AppLayout) */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      } />

    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;