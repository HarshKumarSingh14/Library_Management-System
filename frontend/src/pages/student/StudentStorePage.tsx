import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, IndianRupee, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom"; 

// Book Interface
interface StoreBook {
  _id: string;
  title: string;
  author: string;
  coverImage?: string;
  marketPrice: number;
  ourPrice: number;
  stockForSale: number;
}

export default function StudentStorePage() {
  const { user } = useAuth();
  const navigate = useNavigate(); 
  const API_BASE = "http://localhost:5000/api/store";

  const [books, setBooks] = useState<StoreBook[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Store Books
  const fetchStoreBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/books`);
      if (!response.ok) throw new Error("Failed to load store books");
      
      const data = await response.json();
      const availableBooks = data.filter((b: StoreBook) => b.stockForSale > 0);
      setBooks(availableBooks);
    } catch (error) {
      toast.error("Could not connect to store server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreBooks();
  }, []);

  // 2. Buy Now Logic (Redirect to Unified Payment Page)
  const handleBuyNow = (book: StoreBook) => {
    if (!user) {
      toast.error("Please login to buy books.");
      return;
    }

    // 🚨 UPDATED: Now passing the unified format so the Payment Page knows this is a "book"
    navigate("/payment", { 
      state: { 
        type: 'book',
        itemId: book._id,
        title: book.title,
        amount: book.ourPrice
      } 
    });
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" /> Campus Book Store
          </h1>
          <p className="mt-2 text-blue-100 max-w-xl">
            Buy standard textbooks and reference materials permanently at heavily discounted student prices.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-20 -mb-10 h-32 w-32 bg-white opacity-10 rounded-full blur-xl"></div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-lg mx-auto md:mx-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search books by title or author..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p>Loading store inventory...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No books available in the store right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div key={book._id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
              
              {/* Image Container */}
              <div className="h-48 bg-slate-100 flex items-center justify-center p-4 relative">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <BookOpen className="h-12 w-12 text-slate-300" />
                )}
                <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                  {book.stockForSale} Left
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight">{book.title}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{book.author}</p>
                
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through block mb-0.5">M.R.P: ₹{book.marketPrice}</span>
                    <span className="text-xl font-black text-green-600 flex items-center">
                      <IndianRupee className="h-4 w-4 mr-0.5" />{book.ourPrice}
                    </span>
                  </div>
                  
                  <Button 
                    onClick={() => handleBuyNow(book)} 
                    className="bg-slate-900 hover:bg-blue-600 text-white rounded-xl shadow-sm transition-colors"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}