import { useState, useEffect } from "react";
import { Book } from "@/types/lms";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const API_URL = "http://localhost:5000/api/books";
const emptyBook = { title: "", author: "", category: "", isbn: "", total_copies: 1, available_copies: 1 };

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyBook);

  // 1. Fetch Books from Backend
  const fetchBooks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyBook); setDialogOpen(true); };
  const openEdit = (b: Book) => { setEditing(b); setForm(b); setDialogOpen(true); };

  // 2. Save or Update Logic
  const handleSave = async () => {
    if (!form.title || !form.author) return toast.error("Title and Author are required");

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API_URL}/${editing.id}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editing ? "Book updated" : "Book added");
        setDialogOpen(false);
        fetchBooks(); // Refresh list
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  // 3. Delete Logic
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Book removed");
        fetchBooks();
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Books</h2>
          <p className="text-sm text-muted-foreground">{books.length} books in catalog</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add New Book</Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground text-left">
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Author</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Category</th>
                <th className="py-3 px-4 font-semibold text-center">Copies</th>
                <th className="py-3 px-4 font-semibold text-center">Available</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium">{b.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{b.author}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{b.category}</td>
                  <td className="py-3 px-4 text-center">{b.total_copies}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${b.available_copies > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {b.available_copies}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(Number(b.id))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog remains the same with minor Input type updates */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Book" : "Add New Book"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div><Label>ISBN</Label><Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Total Copies</Label><Input type="number" value={form.total_copies} onChange={(e) => setForm({ ...form, total_copies: +e.target.value })} /></div>
              <div><Label>Available</Label><Input type="number" value={form.available_copies} onChange={(e) => setForm({ ...form, available_copies: +e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? "Update" : "Add"} Book</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}