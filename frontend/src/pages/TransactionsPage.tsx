import { useState, useEffect } from "react";
import { Search, Calendar, User, BookOpen, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState("issue");
  
  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [activeTransactions, setActiveTransactions] = useState<any[]>([]);

  // Form States
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // --- HELPER: AUTH HEADERS (VERY IMPORTANT) ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("library_token"); // AuthContext wala token name use karein
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setFetching(true);
    try {
      // Har fetch call mein headers pass karna zaroori hai
      const [sRes, bRes, tRes] = await Promise.all([
        fetch("https://library-management-system-fdo2.onrender.com/api/students/all", { headers: getAuthHeaders() }),
        fetch("https://library-management-system-fdo2.onrender.com/api/books", { headers: getAuthHeaders() }),
        fetch("https://library-management-system-fdo2.onrender.com/api/transactions/active", { headers: getAuthHeaders() })
      ]);

      if (sRes.status === 401 || bRes.status === 401) {
         toast.error("Session expired. Please login again.");
         return;
      }

      const sData = await sRes.json();
      const bData = await bRes.json();
      const tData = await tRes.json();

      // Students Set Karna
      if(Array.isArray(sData)) {
        setStudents(sData);
      } else {
        console.error("Students data issue:", sData);
      }
      
      // Filter books with copies > 0 and 'available' status
      if(Array.isArray(bData)) {
        setBooks(bData.filter((b: any) => 
          (b.status?.toLowerCase() === 'available') || (b.available_copies > 0)
        ));
      }
      
      if(Array.isArray(tData)) setActiveTransactions(tData);
      
    } catch (error) {
      console.error(error);
      toast.error("Library data load nahi ho paya. Server check karein.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Default Due Date: Today + 7 days
    const date = new Date();
    date.setDate(date.getDate() + 7);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  // --- ISSUE BOOK HANDLER ---
  const handleIssue = async () => {
    if (!selectedStudent || !selectedBook || !dueDate) {
      toast.error("Bhai, saari details bharna zaroori hai!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/transactions/issue", {
        method: "POST",
        headers: getAuthHeaders(), // Yahan bhi Token zaroori hai
        body: JSON.stringify({
          student_id: parseInt(selectedStudent),
          book_id: parseInt(selectedBook),
          due_date: dueDate
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Book successfully Issue ho gayi! Return tab check karein.");
        setActiveTab("return");
        fetchData(); // Data refresh karein
        setSelectedBook("");
        setSelectedStudent("");
      } else {
        toast.error(data.error || data.message || "Issue karne mein problem aayi.");
      }
    } catch (err) {
      toast.error("Server down hai shayad.");
    } finally {
      setLoading(false);
    }
  };

  // --- RETURN BOOK HANDLER ---
  const handleReturn = async (tId: number, bId: number, fine: number) => {
    const confirmMsg = fine > 0 
      ? `Confirm return? Fine collected: ₹${fine}` 
      : "Confirm return?";
    
    if(!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch("https://library-management-system-fdo2.onrender.com/api/transactions/return", {
        method: "POST",
        headers: getAuthHeaders(), // Yahan bhi Token zaroori hai
        body: JSON.stringify({
          transaction_id: tId,
          book_id: bId
        })
      });
      
      if(res.ok) {
        toast.success("Book successfully return ho gayi.");
        fetchData(); // List refresh
      } else {
        toast.error("Return fail ho gaya.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-primary">Circulation Desk</h2>
           <p className="text-muted-foreground text-sm italic">Issue or Return Books</p>
        </div>
        {fetching && <Loader2 className="animate-spin text-primary" />}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 shadow-sm border">
          <TabsTrigger value="issue">Issue Book</TabsTrigger>
          <TabsTrigger value="return">Active Loans / Return</TabsTrigger>
        </TabsList>

        {/* --- ISSUE TAB --- */}
        <TabsContent value="issue" className="mt-6">
          <Card className="max-w-2xl mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader className="bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary w-5 h-5"/> 
                Issuance Form
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><User size={14}/> Select Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={fetching ? "Loading Students..." : "Search a Student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.length > 0 ? students.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name} <span className="text-xs text-muted-foreground ml-2">({s.username || s.roll_no})</span>
                      </SelectItem>
                    )) : <SelectItem value="none" disabled>No students found</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Search size={14}/> Choose Book</label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={fetching ? "Loading Books..." : "Search a book"} />
                  </SelectTrigger>
                  <SelectContent>
                    {books.length > 0 ? books.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.title} <span className="text-xs text-muted-foreground ml-2">by {b.author}</span>
                      </SelectItem>
                    )) : <SelectItem value="none" disabled>No available books</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Calendar size={14}/> Due Date</label>
                <Input 
                   type="date" 
                   className="h-12 cursor-pointer"
                   value={dueDate}
                   onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleIssue} 
                disabled={loading || fetching} 
                className="w-full h-12 text-lg font-bold transition-all hover:scale-[1.01]"
              >
                {loading ? <><Loader2 className="mr-2 animate-spin"/> Processing...</> : "Confirm Issue"}
              </Button>

            </CardContent>
          </Card>
        </TabsContent>

        {/* --- RETURN TAB --- */}
        <TabsContent value="return" className="mt-6">
          <Card className="shadow-lg border-none">
            <CardContent className="p-0 overflow-x-auto">
               {activeTransactions.length === 0 ? (
                 <div className="text-center p-20 flex flex-col items-center gap-3">
                    <CheckCircle size={48} className="text-green-200" />
                    <p className="text-muted-foreground font-medium">No active borrowed books.</p>
                 </div>
               ) : (
                 <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold border-b">
                        <tr>
                          <th className="p-4">Book & Author</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4 text-center">Status / Fine</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {activeTransactions.map((t) => {
                          const fine = t.calculated_fine || 0;
                          return (
                            <tr key={t.transaction_id} className="hover:bg-muted/10 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{t.book_title}</div>
                                <div className="text-xs text-muted-foreground">{t.author}</div>
                              </td>
                              <td className="p-4 font-medium">{t.student_name}</td>
                              <td className="p-4">{new Date(t.due_date).toLocaleDateString('en-GB')}</td>
                              <td className="p-4 text-center">
                                 {fine > 0 ? (
                                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black border border-red-100 flex items-center justify-center gap-1">
                                      <AlertCircle size={12}/> Fine: ₹{fine}
                                    </span>
                                 ) : (
                                    <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                      On Time
                                    </span>
                                 )}
                              </td>
                              <td className="p-4 text-right">
                                 <Button 
                                    size="sm" 
                                    variant={fine > 0 ? "destructive" : "default"}
                                    className="rounded-full px-4"
                                    onClick={() => handleReturn(t.transaction_id, t.book_id, fine)}
                                 >
                                    Accept Return
                                 </Button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                 </table>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
