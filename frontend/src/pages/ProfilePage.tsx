import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { 
  Mail, Phone, GraduationCap, Hash, 
  User as UserIcon, Briefcase, Building, Camera, 
  Trash2, Loader2, AlertTriangle, Calendar, Layers,
  Edit2, Save, X
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth(); 
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    branch: "",
    designation: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || "",
        phone: user.phone || "",
        branch: user.branch || "",
        designation: user.designation || ""
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const CLOUD_NAME = "dwyngm3ue"; 
  const UPLOAD_PRESET = "w6bctnlr"; 

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("File is too large. Max 2MB allowed.");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const cloudData = await cloudRes.json();
      if (!cloudRes.ok) throw new Error("Cloudinary upload failed");

      const imageUrl = cloudData.secure_url;

      const res = await fetch("https://library-management-system-fdo2.onrender.com/api/auth/update-profile-pic", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("library_token")}`
        },
        body: JSON.stringify({ userId: user.id || user._id, role: user.role, imageUrl }),
      });

      if (res.ok) {
        const updatedUser = { ...user, profile_pic: imageUrl };
        setUser(updatedUser);
        localStorage.setItem("library_user", JSON.stringify(updatedUser));
        toast.success("Profile picture updated!");
      }
    } catch (err) {
      toast.error("Failed to update profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDetails = async () => {
    if (!editData.name.trim()) return toast.error("Name cannot be empty!");
    
    if (editData.phone && editData.phone.length !== 10) {
      return toast.error("Phone number must be exactly 10 digits!");
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`https://library-management-system-fdo2.onrender.com/api/auth/update-profile`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("library_token")}`
        },
        body: JSON.stringify({ 
          userId: user.id || user._id, 
          role: user.role, 
          ...editData 
        }),
      });

      if (res.ok) {
        const updatedUser = { ...user, ...editData };
        setUser(updatedUser);
        localStorage.setItem("library_user", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update details.");
      }
    } catch (err) {
      toast.error("Server error while updating.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("⚠️ WARNING: Kya aap pakka apna account delete karna chahte hain?");
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`https://library-management-system-fdo2.onrender.com/api/auth/delete-account`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("library_token")}` 
        },
        body: JSON.stringify({ userId: user.id || user._id, role: user.role })
      });

      if (res.ok) {
        toast.success("Account deleted.");
        logout(); 
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (err) {
      toast.error("Server error.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatYear = (yr: string | undefined) => {
    if (!yr) return "N/A";
    const suffixes: Record<string, string> = { "1": "st", "2": "nd", "3": "rd" };
    return `${yr}${suffixes[yr] || "th"} Year`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 pb-20">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">My Profile</h2>
        {user.role === 'admin' && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button size="sm" onClick={handleUpdateDetails} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      <Card className="border shadow-md overflow-hidden rounded-[2rem]">
        <CardHeader className={`${user.role === 'admin' ? 'bg-red-50' : 'bg-primary/5'} pb-8 border-b`}>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={user.profile_pic || ""} className="object-cover" />
                <AvatarFallback className={`text-4xl font-bold text-white ${user.role === 'admin' ? 'bg-red-600' : 'bg-primary'}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-center md:text-left space-y-1 w-full md:w-auto">
              
              {isEditing && user.role === 'admin' ? (
                <Input 
                  className="text-2xl font-bold h-10 w-full md:w-64 text-center md:text-left mb-2" 
                  value={editData.name} 
                  onChange={(e) => setEditData({...editData, name: e.target.value})} 
                  placeholder="Full Name"
                />
              ) : (
                <h3 className="text-3xl font-bold text-foreground capitalize">{user.name}</h3>
              )}

              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
              <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mt-2 ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>
                {user.role} Portal
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h4 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                <UserIcon className="h-5 w-5 text-muted-foreground" /> Account Info
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium flex items-center gap-2">
                    <Hash className="h-3 w-3" /> {user.role === 'admin' ? 'ID' : 'Roll No / ID'}
                  </span>
                  <span className="font-bold">@{user.username}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium flex items-center gap-2"><Phone className="h-3 w-3" /> Contact</span>
                  {isEditing && user.role === 'admin' ? (
                    <Input 
                      className="h-8 w-40 text-right" 
                      value={editData.phone} 
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        if (numericValue.length > 10) {
                          toast.error("Phone number cannot exceed 10 digits!");
                          return;
                        }
                        setEditData({...editData, phone: numericValue});
                      }} 
                      placeholder="Enter phone"
                      maxLength={10}
                    />
                  ) : (
                    <span className="font-bold">{user.phone || "N/A"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                {user.role === 'admin' ? <Briefcase className="h-5 w-5 text-muted-foreground" /> : <GraduationCap className="h-5 w-5 text-muted-foreground" />}
                {user.role === 'admin' ? 'Organization Details' : 'Academic Profile'}
              </h4>
              <div className="space-y-4">
                {user.role !== 'admin' ? (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium flex items-center gap-2"><Layers className="h-3 w-3" /> Course & Branch</span>
                      <span className="font-bold uppercase">{user.course} - {user.branch}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium flex items-center gap-2"><Calendar className="h-3 w-3" /> Academic Year</span>
                      <span className="font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 transition-all hover:bg-primary/10">
                        {formatYear(user.year)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium flex items-center gap-2"><Building className="h-3 w-3" /> Section</span>
                      <span className="font-bold">{user.section || "N/A"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium flex items-center gap-2"><Building className="h-3 w-3" /> Branch</span>
                      {isEditing ? (
                        <Input 
                          className="h-8 w-40 text-right uppercase" 
                          value={editData.branch} 
                          onChange={(e) => setEditData({...editData, branch: e.target.value})} 
                          placeholder="e.g., Central Library"
                        />
                      ) : (
                        <span className="font-bold uppercase">{user.branch || "Central Library"}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-medium flex items-center gap-2"><Briefcase className="h-3 w-3" /> Designation</span>
                      {isEditing ? (
                        <Input 
                          className="h-8 w-40 text-right" 
                          value={editData.designation} 
                          onChange={(e) => setEditData({...editData, designation: e.target.value})} 
                          placeholder="e.g., Senior Librarian"
                        />
                      ) : (
                        <span className="font-bold">{user.designation || "Senior Librarian"}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="mt-12 pt-8 border-t">
              <div className="bg-red-50/50 border border-red-100 p-6 rounded-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <p className="font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Danger Zone
                  </p>
                  <p className="text-xs text-red-600 font-medium">Account delete karne se saara data permanent delete ho jayega.</p>
                </div>
                <Button variant="destructive" className="rounded-xl px-8 font-bold transition-all hover:scale-105" onClick={handleDeleteAccount} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete Account
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
