import { Book, Transaction, User } from "@/types/lms";

export const mockUsers: User[] = [
  { id: "u1", name: "Admin Librarian", email: "admin@library.com", role: "admin" },
  { id: "u2", name: "Alice Johnson", email: "alice@student.com", role: "student" },
  { id: "u3", name: "Bob Smith", email: "bob@student.com", role: "student" },
  { id: "u4", name: "Carol Davis", email: "carol@student.com", role: "student" },
  { id: "u5", name: "Dan Wilson", email: "dan@student.com", role: "student" },
];

export const mockBooks: Book[] = [
  { id: "b1", title: "Clean Code", author: "Robert C. Martin", category: "Programming", isbn: "978-0132350884", total_copies: 5, available_copies: 3 },
  { id: "b2", title: "Design Patterns", author: "Gang of Four", category: "Programming", isbn: "978-0201633610", total_copies: 3, available_copies: 0 },
  { id: "b3", title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", isbn: "978-0743273565", total_copies: 4, available_copies: 4 },
  { id: "b4", title: "Sapiens", author: "Yuval Noah Harari", category: "History", isbn: "978-0062316097", total_copies: 6, available_copies: 2 },
  { id: "b5", title: "Atomic Habits", author: "James Clear", category: "Self-Help", isbn: "978-0735211292", total_copies: 8, available_copies: 5 },
  { id: "b6", title: "1984", author: "George Orwell", category: "Fiction", isbn: "978-0451524935", total_copies: 3, available_copies: 1 },
  { id: "b7", title: "Introduction to Algorithms", author: "Thomas Cormen", category: "Programming", isbn: "978-0262033848", total_copies: 4, available_copies: 4 },
  { id: "b8", title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", isbn: "978-0374533557", total_copies: 3, available_copies: 0 },
];

export const mockTransactions: Transaction[] = [
  { id: "t1", book_id: "b1", user_id: "u2", issue_date: "2025-01-15", due_date: "2025-01-29", return_date: "2025-01-28", fine_amount: 0, status: "returned" },
  { id: "t2", book_id: "b2", user_id: "u3", issue_date: "2025-01-20", due_date: "2025-02-03", return_date: null, fine_amount: 10, status: "issued" },
  { id: "t3", book_id: "b4", user_id: "u2", issue_date: "2025-01-25", due_date: "2025-02-08", return_date: null, fine_amount: 5, status: "issued" },
  { id: "t4", book_id: "b1", user_id: "u4", issue_date: "2025-02-01", due_date: "2025-02-15", return_date: null, fine_amount: 0, status: "issued" },
  { id: "t5", book_id: "b2", user_id: "u5", issue_date: "2025-01-10", due_date: "2025-01-24", return_date: null, fine_amount: 20, status: "issued" },
  { id: "t6", book_id: "b8", user_id: "u2", issue_date: "2025-01-18", due_date: "2025-02-01", return_date: null, fine_amount: 12, status: "issued" },
  { id: "t7", book_id: "b6", user_id: "u3", issue_date: "2025-02-05", due_date: "2025-02-19", return_date: null, fine_amount: 0, status: "issued" },
  { id: "t8", book_id: "b4", user_id: "u4", issue_date: "2025-01-08", due_date: "2025-01-22", return_date: "2025-01-25", fine_amount: 3, status: "returned" },
];

export function getBookById(id: string): Book | undefined {
  return mockBooks.find((b) => b.id === id);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

export function getStudents(): User[] {
  return mockUsers.filter((u) => u.role === "student");
}

export function calculateFine(dueDate: string, returnDate?: string | null): number {
  const due = new Date(dueDate);
  const ret = returnDate ? new Date(returnDate) : new Date();
  const diffMs = ret.getTime() - due.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
