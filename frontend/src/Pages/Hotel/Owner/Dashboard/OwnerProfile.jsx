import React, { useState, useEffect } from "react";
import { User, Edit, Mail, Shield } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { BASE_URL } from "../../../../../config.js";
import Swal from "sweetalert2";

const OwnerProfile = () => {
  const [user, setUser] = useState({
    name: "Owner",
    email: "",
    profilePic: "",
    contact: "",
  });
  const [isUploadingPic, setIsUploadingPic] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.user) {
          setUser({
            name: decoded.user.name || "Owner",
            email: decoded.user.email || "",
            profilePic: decoded.user.profilePic || "",
            contact: decoded.user.contact || "",
          });
        }
      } catch (err) {
        console.error("Token decode error", err);
      }
    }
  }, []);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setIsUploadingPic(true);
      const token = Cookies.get("token") || localStorage.getItem("token");
      
      const response = await fetch(`${BASE_URL}/api/user/update-profile-pic`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.data && data.data.token) {
          localStorage.setItem("token", data.data.token);
          Cookies.set("token", data.data.token);
        }
        setUser(prev => ({ ...prev, profilePic: data.data.profilePic }));
        Swal.fire('Success', 'Profile picture updated successfully', 'success');
      } else {
        Swal.fire('Error', data.message || 'Failed to update profile picture', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'An error occurred while uploading', 'error');
    } finally {
      setIsUploadingPic(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Owner Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your personal information</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Left Column: Image Upload */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 text-center">
              Profile Picture
            </label>
            <label className="relative w-40 h-40 rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#b90538] bg-slate-50 hover:bg-rose-50/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group shadow-sm">
              {user.profilePic ? (
                <>
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit size={24} className="text-white drop-shadow-md" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-[#b90538] transition-colors">
                  <User size={40} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                </div>
              )}
              
              {isUploadingPic && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-[#b90538] rounded-full animate-spin"></div>
                </div>
              )}
              
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleProfilePicUpload} 
                disabled={isUploadingPic} 
              />
            </label>
            <p className="text-[10px] text-slate-400 mt-4 text-center max-w-[160px]">
              Click the box above to upload a new profile picture.
            </p>
          </div>

          {/* Right Column: User Details */}
          <div className="flex-grow space-y-6 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <User size={18} className="text-slate-400 mr-3" />
                <span className="font-semibold text-slate-800 text-sm">{user.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <Mail size={18} className="text-slate-400 mr-3" />
                <span className="font-semibold text-slate-800 text-sm">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mt-8">
              <Shield size={20} className="text-emerald-600 mr-3 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Verified Hotel Owner</p>
                <p className="text-xs text-emerald-600/80 mt-0.5">Your account has full owner privileges.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;
