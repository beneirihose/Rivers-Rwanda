import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Camera, Save, Shield, CheckCircle2, Lock, Eye, EyeOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const data = response.data.data;
      setProfile(data);
      setFormData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phoneNumber: data.phone_number || ''
      });
      if (data.profile_image) {
        setProfileImagePreview(`https://rivers-rwanda.onrender.com${data.profile_image}`);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('phoneNumber', formData.phoneNumber);
      
      if (fileInputRef.current?.files?.[0]) {
        data.append('profile_image', fileInputRef.current.files[0]);
      }

      await api.patch('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Profile updated successfully');
      fetchProfile();
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
        return toast.error('New passwords do not match');
    }
    if (passData.newPassword.length < 6) {
        return toast.error('Password must be at least 6 characters');
    }

    setPasswordLoading(true);
    try {
        await api.post('/users/change-password', {
            currentPassword: passData.currentPassword,
            newPassword: passData.newPassword
        });
        toast.success('Password changed successfully');
        setShowPasswordModal(false);
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
        setPasswordLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pt-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-dark to-accent-orange opacity-90"></div>
        
        <div className="px-8 pb-12">
          {/* Profile Picture & Header */}
          <div className="relative -mt-16 flex flex-col md:flex-row items-end gap-6 mb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-100 shadow-xl overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={48} />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-accent-orange text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageChange}
              />
            </div>
            
            <div className="flex-grow pb-2">
              <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">
                {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'User Profile'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-orange-50 text-accent-orange text-[10px] font-black uppercase rounded-full tracking-widest border border-orange-100 shadow-sm">
                  {profile?.role} Account
                </span>
                {profile?.status === 'active' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-0.5 bg-accent-orange"></div>
                Personal Information
              </h2>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    name="firstName"
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    name="lastName"
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-6 h-0.5 bg-accent-orange"></div>
                Contact Details
              </h2>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    className="w-full p-4 pl-12 bg-gray-100 border-2 border-transparent rounded-2xl outline-none font-bold text-sm text-gray-500 cursor-not-allowed"
                    value={profile?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    name="phoneNumber"
                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 pt-8 flex justify-end">
              <button 
                type="submit" 
                disabled={updating}
                className="bg-primary-dark text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-orange transition-all duration-500 shadow-xl flex items-center gap-2"
              >
                {updating ? 'Updating...' : (
                  <>
                    <Save size={16} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Security Section */}
      <div className="mt-8 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-bold text-primary-dark uppercase text-xs tracking-widest">Security Settings</h3>
            <p className="text-xs text-text-light mt-1">Manage your password and session security.</p>
          </div>
        </div>
        <button 
            onClick={() => setShowPasswordModal(true)}
            className="text-accent-orange font-black text-[10px] uppercase tracking-widest hover:underline"
        >
            Change Password
        </button>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <AnimatePresence>
        {showPasswordModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPasswordModal(false)}
                    className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-8 bg-primary-dark text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Security Update</h3>
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Change Account Password</p>
                        </div>
                        <button 
                            onClick={() => setShowPasswordModal(false)}
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handlePasswordChange} className="p-8 space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-4 text-gray-300" size={18} />
                                <input 
                                    type={showCurrentPass ? 'text' : 'password'}
                                    className="w-full p-4 pl-12 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-sm transition-all"
                                    placeholder="••••••••"
                                    value={passData.currentPassword}
                                    onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute right-4 top-4 text-gray-300 hover:text-accent-orange"
                                >
                                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-4 text-gray-300" size={18} />
                                <input 
                                    type={showNewPass ? 'text' : 'password'}
                                    className="w-full p-4 pl-12 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-sm transition-all"
                                    placeholder="••••••••"
                                    value={passData.newPassword}
                                    onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                                    required
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute right-4 top-4 text-gray-300 hover:text-accent-orange"
                                >
                                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-2">Confirm New Password</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-4 text-gray-300" size={18} />
                                <input 
                                    type="password"
                                    className="w-full p-4 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-accent-orange focus:bg-white outline-none font-bold text-sm transition-all"
                                    placeholder="••••••••"
                                    value={passData.confirmPassword}
                                    onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full py-5 bg-accent-orange text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-accent-orange/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                            {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
