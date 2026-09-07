import React from 'react';
import { ShoppingCart, Edit, Trash2 } from 'lucide-react'; // Icons add kiye
import { Button } from "@/components/ui/button"; 

export interface BookType {
  _id: string;
  title: string;
  author: string;
  coverImage?: string;
  marketPrice: number;
  ourPrice: number;
  availableCopies: number;
  stockForSale: number;
}

interface BookCardProps {
  book: BookType;
  isAdmin?: boolean; // Pata chalega user admin hai ya nahi
  onBuy: (book: BookType) => void;
  onEdit?: (book: BookType) => void; // Admin Action
  onDelete?: (id: string) => void;   // Admin Action
}

export default function BookCard({ book, isAdmin, onBuy, onEdit, onDelete }: BookCardProps) {
  const savings = book.marketPrice - book.ourPrice;
  const discountPercent = Math.round((savings / book.marketPrice) * 100);

  return (
    <div className="w-full bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group relative">
      
      {/* Admin Actions (Top Right Hover Menu) */}
      {isAdmin && onEdit && onDelete && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm p-1 rounded-lg border">
          <button onClick={() => onEdit(book)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Edit Book">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(book._id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Delete Book">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-56 bg-muted/20 flex justify-center items-center p-4">
        <img 
          src={book.coverImage || "https://via.placeholder.com/150x200?text=No+Cover"} 
          alt={book.title} 
          className="max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
        />
        {discountPercent > 0 && (
          <div className="absolute top-3 left-0 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-r-md shadow-sm">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-base line-clamp-1 mb-1" title={book.title}>
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">by {book.author}</p>

        {/* Pricing Box */}
        <div className="bg-green-50/50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3 mb-5 mt-auto">
          <p className="text-xs text-muted-foreground flex items-center gap-2 mb-1">
            M.R.P: <span className="line-through decoration-red-400">₹{book.marketPrice}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-foreground">₹{book.ourPrice}</span>
            <span className="text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Save ₹{savings}
            </span>
          </div>
        </div>

        {/* Action Button - ONLY BUY NOW */}
        <div className="flex gap-2">
          <Button 
            className="w-full text-xs bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            disabled={book.stockForSale === 0}
            onClick={() => onBuy(book)}
          >
            <ShoppingCart className="w-4 h-4 mr-1.5" />
            {book.stockForSale === 0 ? "Out of Stock" : "Buy Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}