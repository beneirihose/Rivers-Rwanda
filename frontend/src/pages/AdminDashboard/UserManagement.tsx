import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { UserPlus, Shield, User, Trash2, Edit2, X, Mail, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'client',
    status: 'active'
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentId) {
        await api.patch(`/admin/users/${currentId}`, { 
          role: formData.role, 
          status: formData.status 
        });
        toast.success('User updated successfully');
      } else {
        await api.post('/admin/users', formData);
        toast.success('User created successfully');
      }
      
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      setFormData({ email: '', password: '', role: 'client', status: 'active' });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user: any) => {
    setCurrentId(user.id);
    setFormData({
      email: user.email,
      password: '', // Password not editable here
      role: user.role,
      status: user.status
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">User Management</h1>
          <p className="text-text-light mt-1">Control access, roles, and permissions for all platform users.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(false); }}
          className="bg-primary-dark text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-accent-orange transition-all shadow-lg"
        >
          {showForm ? <X size={20} /> : <UserPlus size={20} />}
          {showForm ? 'CLOSE FORM' : 'ADD NEW USER'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
          >
            <h3 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-2">
              {isEditing ? <Edit2 size={20} className="text-accent-orange" /> : <UserPlus size={20} className="text-accent-orange" />}
              {isEditing ? 'Update User Privileges' : 'Create New System User'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {!isEditing && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="email" 
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Initial Password</label>
                    <input 
                      type="password" 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Assign Role</label>
                <select 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none bg-gray-50 font-bold text-primary-dark"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="client">Client (Standard)</option>
                  <option value="agent">Field Agent</option>
                  <option value="seller">Verified Seller</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Account Status</label>
                <select 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none bg-gray-50 font-bold text-primary-dark"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </div>
              <div className="lg:col-span-4 flex justify-end">
                <button type="submit" className="bg-accent-orange text-white px-10 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg">
                  {isEditing ? 'Update Permissions' : 'Create User Account'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Role / Access</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Member Since</th>
                <th className="px-8 py-5 text-center">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                        user.role === 'agent' ? 'bg-orange-100 text-accent-orange' :
                        user.role === 'seller' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-primary-dark tracking-tight">{user.email}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">UID: {user.id.substring(0,12)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      {user.role === 'admin' ? <Shield size={16} className="text-purple-600" /> : 
                       user.role === 'agent' ? <ShieldCheck size={16} className="text-accent-orange" /> : 
                       user.role === 'seller' ? <Store size={16} className="text-blue-600" /> :
                       <User size={16} className="text-gray-600" />}
                      <span className={`text-xs font-black uppercase tracking-widest ${
                        user.role === 'admin' ? 'text-purple-600' :
                        user.role === 'agent' ? 'text-accent-orange' :
                        user.role === 'seller' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.status === 'active' ? 'bg-green-100 text-green-600' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-text-light">{new Date(user.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-3 bg-gray-50 text-gray-400 hover:bg-accent-orange hover:text-white rounded-xl transition-all shadow-sm"
                        title="Edit Permissions"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-3 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                          title="Revoke Access"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ShieldCheck = ({ size, className }: { size: number, className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default UserManagement;
