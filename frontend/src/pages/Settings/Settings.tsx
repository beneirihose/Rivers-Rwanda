import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Lock, Bell, User, ChevronRight, Eye, EyeOff } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'profile'>('security');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onPasswordSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully!');
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-primary-dark uppercase tracking-tighter">Settings</h1>
        <p className="text-gray-500 font-medium">Manage your account security and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-1/4 space-y-2">
          {[
            { id: 'security', label: 'Security & Password', icon: <Shield size={18}/> },
            { id: 'profile', label: 'Account Profile', icon: <User size={18}/> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={18}/> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary-dark text-white shadow-xl' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                {tab.icon}
                {tab.label}
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100">
          {activeTab === 'security' && (
            <div className="max-w-md space-y-8">
              <div className="space-y-2">
                <div className="h-12 w-12 bg-orange-100 text-accent-orange rounded-2xl flex items-center justify-center mb-4">
                    <Lock size={24} />
                </div>
                <h2 className="text-2xl font-black text-primary-dark uppercase tracking-tight">Update Password</h2>
                <p className="text-gray-500 text-sm font-medium">Ensure your account is using a long, random password to stay secure.</p>
              </div>

              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrent ? 'text' : 'password'} 
                      {...register('currentPassword')}
                      className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none focus:border-accent-orange transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.currentPassword.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNew ? 'text' : 'password'} 
                      {...register('newPassword')}
                      className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none focus:border-accent-orange transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.newPassword.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Confirm New Password</label>
                  <input 
                    type="password" 
                    {...register('confirmPassword')}
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none focus:border-accent-orange transition-all"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.confirmPassword.message as string}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary-dark text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs hover:bg-accent-orange transition-all duration-300 shadow-xl disabled:bg-gray-300"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-primary-dark uppercase tracking-tight">Profile Settings</h2>
               <p className="text-gray-500">To update your profile information, please go to the <a href="/profile" className="text-accent-orange font-bold underline">Profile Page</a>.</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
               <h2 className="text-2xl font-black text-primary-dark uppercase tracking-tight">Notification Preferences</h2>
               <div className="space-y-4">
                  {[
                    { label: 'Email Notifications', desc: 'Receive updates about bookings via email.' },
                    { label: 'Booking Alerts', desc: 'Get notified when a booking is confirmed.' },
                    { label: 'System Announcements', desc: 'Important news and platform updates.' },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                        <div>
                            <p className="font-bold text-primary-dark uppercase text-[10px] tracking-widest">{pref.label}</p>
                            <p className="text-xs text-gray-500">{pref.desc}</p>
                        </div>
                        <div className="w-12 h-6 bg-accent-orange rounded-full relative p-1 cursor-pointer">
                            <div className="h-4 w-4 bg-white rounded-full absolute right-1"></div>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
