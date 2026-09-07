export type UserRole = "admin" | "student";

export interface User {
  id: string | number; // Updated to support both number and MongoDB string ID formats
  _id?: string;        // Added MongoDB _id support
  username: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profile_pic?: string;
  course?: string;
  branch?: string;
  year?: string;   
  section?: string;
  designation?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
  status?: string; 
  
  // 👇 YEH NAYE FIELDS ADD KIYE HAIN STORE KE LIYE
  cover_image?: string;
  market_price?: number;
  our_price?: number;
  stock_for_sale?: number;
}

export type TransactionStatus = "pending" | "issued" | "returned" | "rejected";

export interface Transaction {
  id: string;
  book_id: string;
  user_id: string;
  book_title?: string;  
  student_name?: string; 
  issue_date: string | null;
  due_date: string | null;
  request_date?: string; 
  return_date: string | null;
  fine_amount: number;
  status: TransactionStatus;
}