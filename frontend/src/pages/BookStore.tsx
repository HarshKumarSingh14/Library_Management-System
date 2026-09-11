import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Edit, Trash2, IndianRupee, BookOpen, Image as ImageIcon, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
// Agar aap custom hook se token le rahe hain, warna hum direct localStorage use kar lenge.

// Book Interface (matches backend SQL structure)
export interface BookType {
  _id: string; // React interface me _id rakha hai, humne SQL me id AS _id send kiya tha
  title: string;
  author: string;
  coverImage?: string;
  marketPrice: number;
  ourPrice: number;
  availableCopies: number;
  stockForSale: number;
}

export default function BookStore() {
  // Backend URL config (Change this if your server port is different)
  const API_BASE = "/api/store"; 
  
  // --- States ---
  const [books, setBooks] = useState<BookType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "", author: "", marketPrice: "", ourPrice: "", 
    stockForSale: "", availableCopies: "", coverImage: ""
  });

  // -----------------------------------------------------
  // 1. FETCH BOOKS FROM DATABASE (Replaces Dummy Data)
  // -----------------------------------------------------
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // API request bhej rahe hain backend par
      const response = await fetch(`${API_BASE}/books`);
      
      if (!response.ok) {
         throw new Error("Failed to fetch inventory from server.");
      }

      const data = await response.json();
      setBooks(data); // Backend se aayi list set kar di
    } catch (error) {
      console.error(error);
      toast.error("Could not connect to server to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // -----------------------------------------------------
  // 2. DELETE BOOK LOGIC (API Call)
  // -----------------------------------------------------
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE}/books/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();

        if (response.ok && data.success) {
           // Success: state se hata do (ya wapas fetchInventory() call kar lo)
           setBooks(books.filter(b => b._id !== id));
           toast.success(`"${title}" deleted successfully! 🗑️`);
        } else {
           toast.error(data.error || "Failed to delete book.");
        }
      } catch (error) {
        console.error(error);
        toast.error("Server error while deleting.");
      }
    }
  };

  // -----------------------------------------------------
  // 3. ADD / EDIT SUBMIT LOGIC (API Call)
  // -----------------------------------------------------
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form se aaye string values ko numbers me convert karna zaroori hai database ke liye
    const payload = {
      title: formData.title,
      author: formData.author,
      coverImage: formData.coverImage,
      marketPrice: Number(formData.marketPrice),
      ourPrice: Number(formData.ourPrice),
      stockForSale: Number(formData.stockForSale),
      availableCopies: Number(formData.availableCopies)
    };

    try {
      const url = editingId ? `${API_BASE}/books/${editingId}` : `${API_BASE}/books`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        setShowModal(false);
        setEditingId(null);
        fetchInventory(); // Wapas table refresh karne ke liye
      } else {
        toast.error(data.error || "Failed to save book data.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server connection failed.");
    }
  };

  // --- UI Handlers (unchanged) ---
  const handleEdit = (book: BookType) => {
    setEditingId(book._id);
    setFormData({
      title: book.title, author: book.author,
      marketPrice: book.marketPrice.toString(), ourPrice: book.ourPrice.toString(),
      stockForSale: book.stockForSale.toString(), availableCopies: book.availableCopies.toString(),
      coverImage: book.coverImage || ""
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", author: "", marketPrice: "", ourPrice: "", stockForSale: "", availableCopies: "", coverImage: "" });
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600 h-6 w-6" /> Inventory Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage store books, pricing, and library copies.</p>
        </div>
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search inventory by title or author..." 
          className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Book Details</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4 text-center">Store Stock</th>
                <th className="px-6 py-4 text-center">Lib Copies</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent mb-2"></div>
                    <p>Loading inventory from database...</p>
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No books found in the database.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50 transition-colors group">
                    {/* Column 1: Details & Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-12 shrink-0 rounded overflow-hidden bg-slate-100 border flex items-center justify-center">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 line-clamp-1">{book.title}</p>
                          <p className="text-xs text-slate-500">{book.author}</p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Pricing */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-green-600 text-base">₹{book.ourPrice}</span>
                        <span className="text-xs text-slate-400 line-through">M.R.P: ₹{book.marketPrice}</span>
                      </div>
                    </td>

                    {/* Column 3: Store Stock */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        book.stockForSale > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>
                        {book.stockForSale > 0 ? `${book.stockForSale} in Stock` : "Out of Stock"}
                      </span>
                    </td>

                    {/* Column 4: Library Copies */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {book.availableCopies} Available
                      </span>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(book)} className="text-blue-600 hover:bg-blue-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(book._id, book.title)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / EDIT BOOK MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Book Data" : "Add New Book"}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-800 rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Book Title</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Atomic Habits" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Author Name</label>
                  <input required name="author" value={formData.author} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. James Clear" />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><IndianRupee className="h-4 w-4" /> E-Commerce Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Market Price (M.R.P)</label>
                    <input required name="marketPrice" value={formData.marketPrice} onChange={handleInputChange} type="number" min="0" className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Our Selling Price</label>
                    <input required name="ourPrice" value={formData.ourPrice} onChange={handleInputChange} type="number" min="0" className="w-full px-4 py-2 border rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 750" />
                  </div>
                </div>
              </div>

              {/* Inventory Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-600 uppercase tracking-wide">Store Stock (For Sale)</label>
                  <input required name="stockForSale" value={formData.stockForSale} onChange={handleInputChange} type="number" min="0" className="w-full px-4 py-2.5 border rounded-xl bg-amber-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-blue-600 uppercase tracking-wide">Library Copies (For Borrow)</label>
                  <input required name="availableCopies" value={formData.availableCopies} onChange={handleInputChange} type="number" min="0" className="w-full px-4 py-2.5 border rounded-xl bg-blue-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Cover Image URL (Optional)</label>
                <input name="coverImage" value={formData.coverImage} onChange={handleInputChange} type="url" className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                  {editingId ? "Update Book Info" : "Save to Inventory"}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
