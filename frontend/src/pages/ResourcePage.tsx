import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, PlayCircle, FileText, Plus, Trash2, X, 
  ExternalLink, BookOpen, FileQuestion, Loader2, UploadCloud, 
  Link as LinkIcon, RefreshCcw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Resource {
  id: number;
  title: string;
  type: string;
  course: string;
  branch: string;
  year: string;
  url: string;
}

interface ResourcePageProps {
  pageType: "video" | "note" | "quiz" | "pyq";
}

export default function ResourcePage({ pageType }: ResourcePageProps) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const hasSynced = useRef(false);

  // --- 1. FILTER STATES ---
  const [course, setCourse] = useState("All");
  const [branch, setBranch] = useState("All");
  const [year, setYear] = useState("All");
  const [search, setSearch] = useState("");
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"link" | "file">("link");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newResource, setNewResource] = useState({ 
    title: "", course: "B.TECH", branch: "CS", year: "1", url: "" 
  });

  // --- 2. PERSONALIZATION SYNC (Case-Insensitive Fix) ---
  useEffect(() => {
    if (!authLoading && user && !isAdmin && !hasSynced.current) {
      // 🔥 FIX: user.course ko force karke Uppercase set kar rahe hain
      const standardCourse = user.course ? user.course.toUpperCase() : "All";
      console.log("Syncing Profile (Standardized):", standardCourse);
      
      setCourse(standardCourse);
      setBranch("All"); 
      setYear("All");
      hasSynced.current = true;
    }
  }, [user, isAdmin, authLoading]);

  // --- 3. SMART FETCH LOGIC ---
  const fetchResources = async () => {
    if (authLoading || !user) return;

    setLoading(true);

    // Student ke liye hamesha uska profile wala course lock rahega
    const courseToFetch = !isAdmin ? (user.course?.toUpperCase() || course) : course;

    const params = { 
      type: pageType, 
      course: courseToFetch !== "All" ? courseToFetch : undefined, 
      branch: branch !== "All" ? branch : undefined, 
      year: year !== "All" ? year : undefined, 
      search: search.trim() || undefined
    };

    console.log("Strict Fetching for:", params);

    try {
      const response = await axios.get("http://localhost:5000/api/resources", { params });
      setResources(response.data);
    } catch (error) { 
      console.error("Fetch Error:", error);
      toast.error("Library sync failed");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchResources(); 
  }, [pageType, course, branch, year, search, authLoading]);

  // --- 4. HANDLERS ---
  const handleCourseChange = (val: string) => {
    setNewResource({ ...newResource, course: val, branch: val === "B.TECH" ? "CS" : "General" });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", newResource.title);
    formData.append("type", pageType);
    formData.append("course", newResource.course);
    formData.append("branch", newResource.branch);
    formData.append("year", newResource.year);

    if (uploadMode === "file" && selectedFile) {
        formData.append("file", selectedFile);
    } else {
        formData.append("url", newResource.url);
    }

    try {
      await axios.post("http://localhost:5000/api/resources/add", formData);
      setIsUploadOpen(false);
      setNewResource({ title: "", course: "B.TECH", branch: "CS", year: "1", url: "" });
      setSelectedFile(null);
      fetchResources();
      toast.success("Resource uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Remove this permanently?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resources/${id}`);
      setResources(resources.filter(r => r.id !== id));
      toast.success("Deleted from library");
    } catch (error) { toast.error("Delete failed"); }
  };

  const pageDetails = (() => {
    switch(pageType) {
      case 'video': return { title: "Video Lectures", icon: <PlayCircle className="text-blue-500"/>, color: "from-blue-500 to-cyan-500" };
      case 'note': return { title: "Digital Notes", icon: <FileText className="text-orange-500"/>, color: "from-orange-500 to-amber-500" };
      case 'pyq': return { title: "Exam Papers", icon: <FileQuestion className="text-red-500"/>, color: "from-red-500 to-rose-500" };
      default: return { title: "Library", icon: <BookOpen/>, color: "from-indigo-500 to-purple-500" };
    }
  })();

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${pageDetails.color} bg-opacity-10 shadow-sm`}>{pageDetails.icon}</div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{pageDetails.title}</h1>
          </div>
          {!isAdmin && user && (
            <div className="flex items-center gap-2 text-primary font-black text-[10px] ml-2 mt-2 bg-primary/5 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              PORTAL: {course.toUpperCase()} - ALL BRANCHES
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search within your course..." className="pl-10 h-12 rounded-2xl border-gray-100 bg-white shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isAdmin && (
            <Button className="h-12 px-8 rounded-2xl bg-primary shadow-lg shadow-primary/20 font-bold gap-2" onClick={() => setIsUploadOpen(true)}>
              <Plus className="h-5 w-5" /> Add New
            </Button>
          )}
        </div>
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest">
            <Filter className="h-3 w-3" /> Filters
        </div>
        
        <select 
          className="premium-select bg-primary/5 text-primary" 
          value={course} 
          onChange={(e) => isAdmin && setCourse(e.target.value)}
          disabled={!isAdmin}
        >
          {isAdmin ? (
            <>
              <option value="All">All Courses</option>
              <option value="B.TECH">B.Tech</option><option value="BCA">BCA</option>
              <option value="MCA">MCA</option><option value="MBA">MBA</option>
            </>
          ) : (
            <option value={course}>{course.toUpperCase()}</option>
          )}
        </select>

        <div className="w-px bg-gray-100 h-6 hidden sm:block"></div>

        {(isAdmin || course === "B.TECH") && (
          <select className="premium-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="All">All Branches</option>
            <option value="CS">CS</option><option value="IT">IT</option>
            <option value="ME">Mechanical</option><option value="Common">Common</option>
          </select>
        )}

        <select className="premium-select" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="All">All Years</option>
          <option value="1">1st Year</option><option value="2">2nd Year</option>
          <option value="3">3rd Year</option><option value="4">4th Year</option>
        </select>

        <Button variant="ghost" size="sm" onClick={() => {setBranch("All"); setYear("All");}} className="text-gray-400 hover:text-primary rounded-xl font-bold ml-auto">
            <RefreshCcw className="h-3 w-3 mr-2"/> Reset (Show {course})
        </Button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-gray-50 animate-pulse border-2 border-dashed border-gray-100" />)}
        </div>
      ) : resources.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {resources.map((item, index) => (
              <motion.div
                key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-5 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="aspect-video rounded-[2rem] bg-slate-50 flex items-center justify-center relative mb-5">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/40 pointer-events-none" />
                  {pageType === 'video' ? <PlayCircle className="w-16 h-16 text-blue-500/20 group-hover:text-blue-500 transition-all duration-500 group-hover:scale-110" /> : <FileText className="w-16 h-16 text-primary/20 group-hover:text-primary transition-all duration-500" /> }
                  <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black shadow-sm border border-white/50">{item.course}</span>
                    <span className="px-3 py-1 bg-primary text-white rounded-full text-[9px] font-black shadow-md">YEAR {item.year}</span>
                  </div>
                  {isAdmin && <button onClick={() => handleDelete(item.id)} className="absolute top-4 left-4 p-2.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shadow-lg"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <h3 className="font-bold text-gray-800 text-lg line-clamp-2 px-1 mb-5 h-12 leading-tight uppercase tracking-tight">{item.title}</h3>
                <Button 
  className="w-full rounded-2xl gap-3 font-black py-7 shadow-xl shadow-primary/10 transition-transform active:scale-95 hover:scale-[1.02]" 
  variant={pageType === 'video' ? 'default' : 'secondary'} 
  asChild
>
  <a 
    href={
      // 🔥 Logic: Cloudinary URL mein agar .pdf nahi hai toh append karein
      item.url.includes("cloudinary") && pageType !== 'video' && !item.url.toLowerCase().endsWith(".pdf")
      ? `${item.url}.pdf` 
      : item.url
    } 
    target="_blank" 
    rel="noopener noreferrer"
  >
    {pageType === 'video' ? 'Watch Video' : 'View Document'}
    <ExternalLink className="h-4 w-4" />
  </a>
</Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-800">No Materials Found</h3>
            <p className="text-gray-400 max-w-sm mx-auto text-sm mt-2 font-medium tracking-tight">Try clearing your filters or check if resources have been uploaded for {course}.</p>
        </div>
      )}

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadOpen(false)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">New {pageType}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsUploadOpen(false)} className="rounded-full h-12 w-12"><X className="h-6 w-6" /></Button>
                </div>
                <form onSubmit={handleUpload} className="space-y-6">
                  <Input placeholder="Resource Title..." value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} className="h-14 rounded-2xl border-gray-100" required />
                  <div className="grid grid-cols-2 gap-5">
                    <select className="premium-select border bg-gray-50 h-14" value={newResource.course} onChange={(e) => handleCourseChange(e.target.value)}>
                        <option value="B.TECH">B.Tech</option><option value="BCA">BCA</option><option value="MCA">MCA</option><option value="MBA">MBA</option>
                    </select>
                    <select className="premium-select border bg-gray-50 h-14" value={newResource.year} onChange={(e) => setNewResource({...newResource, year: e.target.value})}>
                        <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
                    </select>
                  </div>
                  {newResource.course === "B.TECH" && (
                    <select className="premium-select w-full border bg-gray-50 h-14" value={newResource.branch} onChange={(e) => setNewResource({...newResource, branch: e.target.value})}>
                      <option value="CS">Computer Science</option><option value="IT">IT</option><option value="ME">Mechanical</option><option value="Common">Common</option>
                    </select>
                  )}
                  <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                    <button type="button" onClick={() => setUploadMode("link")} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${uploadMode === 'link' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>LINK</button>
                    <button type="button" onClick={() => setUploadMode("file")} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${uploadMode === 'file' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>FILE</button>
                  </div>
                  {uploadMode === 'link' ? (
                    <Input placeholder="URL https://..." value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} className="h-14 rounded-2xl border-gray-100" required />
                  ) : (
                    <div className="border-4 border-dotted border-gray-100 rounded-[2rem] p-8 text-center hover:border-primary transition-all relative cursor-pointer group bg-gray-50/30">
                        <input type="file" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer" required />
                        <UploadCloud className="h-10 w-10 text-gray-300 mx-auto mb-2 group-hover:text-primary transition-all" />
                        <p className="text-sm font-black text-gray-600 tracking-tighter uppercase">{selectedFile ? selectedFile.name : "Select PDF"}</p>
                    </div>
                  )}
                  <Button type="submit" disabled={isUploading} className="w-full h-16 rounded-[1.5rem] text-lg font-black shadow-2xl shadow-primary/30 uppercase mt-4">
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Publish Resource"}
                  </Button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style>{`.premium-select { @apply bg-transparent text-sm font-black px-4 py-2 outline-none cursor-pointer border-none rounded-xl transition-all; }`}</style>
    </motion.div>
  );
}