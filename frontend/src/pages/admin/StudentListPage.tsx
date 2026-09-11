import { useState, useEffect } from "react";
import { Users, Search, Mail, Loader2, AlertCircle, MoreVertical, Trash2, Edit, History, Save, Eraser } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function StudentsListPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- FILTER STATES ---
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  
  // --- MODAL STATES ---
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", course: "", branch: "" });

  // --- HELPER: AUTH TOKEN ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("library_token"); 
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  // --- 1. FETCH STUDENTS ---
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students/all", {
        headers: getAuthHeaders()
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Database connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- 2. EDIT LOGIC ---
  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      phone: student.phone || "",
      course: student.course || "",
      branch: student.branch || ""
    });
    setEditOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedStudent) return;
    
    // NEW: Mobile Number 10 digit strict check
    if (editForm.phone && editForm.phone.length !== 10) {
      return toast.error("Phone number must be exactly 10 digits!");
    }

    try {
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        toast.success("Student updated!");
        setEditOpen(false);
        fetchStudents();
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  // --- 3. HISTORY LOGIC ---
  const handleViewHistory = async (student: any) => {
    setSelectedStudent(student);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/transactions/student/${student.id}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      setStudentHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("History fetch failed");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!selectedStudent) return;
    if (!window.confirm("Are you sure? This will delete all history.")) return;
    try {
       const res = await fetch(`/api/transactions/student/${selectedStudent.id}`, {
         method: 'DELETE',
         headers: getAuthHeaders()
       });
       if (res.ok) {
         toast.success("History cleared");
         setStudentHistory([]); 
       } else {
         toast.error("Failed to clear history");
       }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if(!window.confirm("Delete student account permanently?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { 
        method: 'DELETE', 
        headers: getAuthHeaders()
      });
      if(res.ok) {
        toast.success("Account deleted");
        fetchStudents();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error deleting student");
    }
  };

  // ==========================================
  // 🚀 SMART FILTER LOGIC STARTS HERE
  // ==========================================

  // 1. Get Unique Courses for First Dropdown
  const uniqueCourses = Array.from(new Set(
    students.map(s => s.course).filter(Boolean)
  ));

  // 2. Get Available Branches based on Selected Course
  const availableBranches = Array.from(new Set(
    students
      .filter(s => courseFilter === "all" || s.course === courseFilter)
      .map(s => s.branch)
      .filter(Boolean)
  ));

  // 3. Final List Filtering
  const filtered = students.filter(s => {
    const name = s?.name?.toLowerCase() || "";
    const username = s?.username?.toLowerCase() || "";
    const query = search.toLowerCase();
    
    return (name.includes(query) || username.includes(query)) &&
           (courseFilter === "all" || s.course === courseFilter) &&
           (branchFilter === "all" || s.branch === branchFilter);
  });

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-card p-6 rounded-3xl border shadow-sm">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Users className="text-primary h-8 w-8" /> Student Directory
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Total {filtered.length} students found</p>
        </div>
      </div>

      {/* --- SMART FILTERS UI --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/80 p-4 rounded-2xl border sticky top-0 z-10">
        
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search name or ID..." 
            className="pl-10 h-10 bg-muted/50 border-none" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Course Select */}
        <Select 
          value={courseFilter} 
          onValueChange={(val) => {
            setCourseFilter(val);
            setBranchFilter("all"); 
          }}
        >
          <SelectTrigger className="h-10 bg-muted/50 border-none"><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {uniqueCourses.map((c: any) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Branch Select (Dependent on Course) */}
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="h-10 bg-muted/50 border-none"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
             <SelectItem value="all">All Branches</SelectItem>
             {availableBranches.map((b: any) => (
               <SelectItem key={b} value={b}>{b}</SelectItem>
             ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- STUDENT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div key={s.id} className="bg-card border rounded-[2rem] p-6 hover:shadow-xl relative transition-all">
            {s.total_fine > 0 && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> ₹{s.total_fine} Due
              </div>
            )}
            
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewHistory(s)}><History className="mr-2 h-4 w-4" /> History</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditClick(s)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDeleteAccount(s.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col items-center mt-6">
              <Avatar className="h-20 w-20 border-4 shadow-lg">
                <AvatarImage src={s.profile_pic} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">{s.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <h4 className="font-bold text-lg mt-3 text-center">{s.name || "Unknown"}</h4>
              <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md mt-1">{s.username || "NO ID"}</p>
            </div>

            <div className="mt-6 flex justify-between gap-2 text-center border-t border-dashed pt-4">
              <div className="flex-1"><p className="text-[10px] uppercase text-muted-foreground font-bold">Course</p><p className="font-bold text-xs">{s.course || "N/A"}</p></div>
              <div className="h-8 w-px bg-muted" />
              <div className="flex-1"><p className="text-[10px] uppercase text-muted-foreground font-bold">Books</p><p className="font-black text-primary">{s.active_books || 0}</p></div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg">
               <Mail className="h-3 w-3" /> <span className="truncate max-w-[150px]">{s.email || "No Email"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phone</Label>
              <Input 
                value={editForm.phone} 
                onChange={(e) => {
                  // NEW: Strict validation while typing
                  const numericValue = e.target.value.replace(/\D/g, '');
                  if (numericValue.length > 10) {
                    toast.error("Phone number cannot exceed 10 digits!");
                    return;
                  }
                  setEditForm({...editForm, phone: numericValue});
                }} 
                className="col-span-3" 
                maxLength={10}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Course</Label>
              <div className="col-span-3">
                <Select value={editForm.course} onValueChange={(val) => setEditForm({...editForm, course: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                     <SelectItem value="MBA">MBA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Branch</Label>
              <div className="col-span-3">
                <Select value={editForm.branch} onValueChange={(val) => setEditForm({...editForm, branch: val})}>
                  <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="CS">CS</SelectItem>
                     <SelectItem value="IT">IT</SelectItem>
                     <SelectItem value="Mechanical">Mechanical</SelectItem>
                     <SelectItem value="Civil">Civil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveChanges}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HISTORY MODAL */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl">
           <DialogHeader className="flex justify-between items-center pr-8">
             <DialogTitle>History: {selectedStudent?.name}</DialogTitle>
             {studentHistory.length > 0 && <Button variant="destructive" size="sm" onClick={handleDeleteHistory}><Eraser className="h-4 w-4 mr-2"/>Clear</Button>}
           </DialogHeader>
           <div className="space-y-4 mt-4">
             {historyLoading ? <Loader2 className="animate-spin mx-auto" /> : studentHistory.length > 0 ? (
               studentHistory.map((t, index) => (
                 <div key={index} className="flex justify-between items-center p-4 bg-muted/30 rounded-xl border">
                    <div>
                        <h4 className="font-bold flex items-center gap-2"><History className="h-3 w-3"/>{t.title}</h4>
                        <div className="text-xs text-muted-foreground mt-1">Issued: {new Date(t.issue_date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{t.status.toUpperCase()}</span>
                       {t.fine_amount > 0 && <div className="text-red-600 text-xs font-bold mt-1">Fine: ₹{t.fine_amount}</div>}
                    </div>
                 </div>
               ))
             ) : <p className="text-center text-muted-foreground py-10">No history found.</p>}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
