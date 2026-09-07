import { useState, useEffect } from "react";
import { Search, BookOpen, Loader2, Hash, HandHelping, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Book } from "@/types/lms";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const { user, isAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 1. Changed type from number[] to string[] for MongoDB ObjectIDs
  const [requestedBooks, setRequestedBooks] = useState<string[]>([]); 
  const [btnLoading, setBtnLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      fetchAllBooks();
    } else {
      const delayDebounceFn = setTimeout(() => {
        searchFromDB(query);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [query]);

  const fetchAllBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/books");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      toast.error("Could not load catalog");
    } finally {
      setLoading(false);
    }
  };

  const searchFromDB = async (searchTerm: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/books/search?q=${searchTerm}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowRequest = async (bookId: string, title: string) => {
    // 🛠️ FIX: Use user?._id or user?.id safely as string
    const studentId = user?._id || user?.id;

    if (!studentId) {
      toast.error("Please login first");
      return;
    }

    setBtnLoading(bookId); 
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("library_token")}`
        },
        body: JSON.stringify({
          userId: studentId,   // Backend expects userId or student_id depending on your controller
          student_id: studentId, // Passing both to ensure safety
          bookId: bookId,
          book_id: bookId
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Request sent for "${title}"!`);
        setRequestedBooks((prev) => [...prev, bookId]);
      } else {
        if(data.message && data.message.toLowerCase().includes("already")) {
           setRequestedBooks((prev) => [...prev, bookId]);
        }
        toast.error(data.message || "Request failed");
      }
    } catch (err) {
      toast.error("Server connection failed");
    } finally {
      setBtnLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Explore Catalog</h2>
          <p className="text-muted-foreground mt-1">Search and request books instantly.</p>
        </div>
      </div>

      <div className="relative max-w-2xl group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Search className="h-4 w-4 text-muted-foreground" />}
        </div>
        <Input
          placeholder="Search by title, author, or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 text-md shadow-sm border-2 focus-visible:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((b) => {
          // 🛠️ FIX: Use string comparison for MongoDB _id (supporting both id and _id fields)
          const bookKey = String(b.id || (b as any)._id);
          const isRequested = requestedBooks.includes(bookKey);

          return (
            <div key={bookKey} className="group bg-card rounded-2xl border p-6 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    b.available_copies > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {b.available_copies > 0 ? "Available" : "Checked Out"}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{b.category}</span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 italic">by {b.author}</p>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pt-4 border-t border-dashed">
                  <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {b.isbn || "N/A"}</span>
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {b.available_copies}/{b.total_copies}</span>
                </div>

                {!isAdmin && (
                  <Button 
                    className={`w-full gap-2 transition-all ${isRequested ? "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200" : ""}`}
                    disabled={b.available_copies === 0 || btnLoading === bookKey || isRequested}
                    onClick={() => handleBorrowRequest(bookKey, b.title)}
                    variant={isRequested ? "outline" : "default"}
                  >
                    {btnLoading === bookKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isRequested ? (
                      <Clock className="h-4 w-4" /> 
                    ) : (
                      <HandHelping className="h-4 w-4" />
                    )}
                    
                    {isRequested 
                      ? "Pending Approval" 
                      : b.available_copies > 0 
                        ? "Request to Borrow" 
                        : "Notify Me"
                    }
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}