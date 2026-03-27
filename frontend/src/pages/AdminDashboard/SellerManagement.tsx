import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  CreditCard, 
  Eye, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SellerManagement = () => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState<any>(null);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/sellers');
      const data = response.data.data || [];
      setSellers(data);
      setFilteredSellers(data);
    } catch (error) {
      toast.error('Failed to fetch sellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    let result = sellers;
    if (searchTerm) {
      result = result.filter(s => 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone_number.includes(searchTerm)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }
    setFilteredSellers(result);
  }, [searchTerm, statusFilter, sellers]);

  const handleApproval = async (sellerId: string, action: 'approve' | 'reject') => {
    const confirmMessage = action === 'approve' ? 'Are you sure you want to approve this seller?' : 'Are you sure you want to reject this seller?';
    if (!window.confirm(confirmMessage)) return;

    try {
      await api.patch(`/admin/sellers/${sellerId}/${action}`);
      toast.success(`Seller ${action}d successfully!`);
      fetchSellers();
      if (selectedSeller?.id === sellerId) setSelectedSeller(null);
    } catch (error) {
      toast.error(`Failed to ${action} seller`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  const stats = {
    total: sellers.length,
    approved: sellers.filter(s => s.status === 'approved').length,
    pending: sellers.filter(s => s.status === 'pending').length,
    rejected: sellers.filter(s => s.status === 'rejected').length,
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter leading-none">Seller Management</h1>
          <p className="text-text-light mt-1 font-medium">Verify and manage sellers on the platform.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Approved', value: stats.approved, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pending', value: stats.pending, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className={`${s.bg} px-6 py-4 rounded-3xl border border-white shadow-sm flex flex-col justify-center min-w-[120px]`}
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search sellers by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent-orange/20 transition-all"
          />
        </div>
        <div className="relative w-full md:w-auto">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-accent-orange/20 appearance-none cursor-pointer w-full md:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sellers List */}
        <div className={`${selectedSeller ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Seller Info</th>
                    <th className="px-8 py-6">National ID</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-sm">
                  {filteredSellers.map((seller, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={seller.id} 
                      onClick={() => setSelectedSeller(seller)}
                      className={`cursor-pointer transition-all ${selectedSeller?.id === seller.id ? 'bg-orange-50/50' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${
                            seller.status === 'pending' ? 'bg-orange-400' : seller.status === 'approved' ? 'bg-green-500' : 'bg-red-400'
                          }`}>
                            {seller.first_name[0].toUpperCase()}{seller.last_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-primary-dark uppercase tracking-tight leading-none text-base">
                              {seller.first_name} {seller.last_name}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold">{seller.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-xs text-gray-500">
                        {seller.national_id}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                          seller.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                          seller.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            seller.status === 'approved' ? 'bg-green-500' : 
                            seller.status === 'pending' ? 'bg-orange-500 animate-pulse' : 
                            'bg-red-500'
                          }`}></div>
                          {seller.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button className="p-3 bg-gray-100 text-gray-400 hover:bg-primary-dark hover:text-white rounded-xl transition-all group-hover:shadow-md">
                          <Eye size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredSellers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <Users size={64} strokeWidth={1} />
                          <p className="text-sm font-black uppercase tracking-widest">No sellers found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Panel */}
        <AnimatePresence>
          {selectedSeller && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden sticky top-32">
                {/* Panel Header */}
                <div className="p-8 bg-primary-dark text-white relative">
                  <button 
                    onClick={() => setSelectedSeller(null)}
                    className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-accent-orange flex items-center justify-center font-black text-3xl text-white shadow-2xl">
                      {selectedSeller.first_name[0]}{selectedSeller.last_name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        {selectedSeller.first_name}<br/>{selectedSeller.last_name}
                      </h3>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] mt-2">Professional Seller</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Mail className="text-accent-orange" size={18} />
                      <span className="text-xs font-bold">{selectedSeller.email}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Phone className="text-accent-orange" size={18} />
                      <span className="text-xs font-bold">{selectedSeller.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <CreditCard className="text-accent-orange" size={18} />
                      <span className="text-xs font-bold">ID: {selectedSeller.national_id}</span>
                    </div>
                  </div>
                </div>

                {/* Panel Content */}
                <div className="p-8 space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Verification Actions</h4>
                    {selectedSeller.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleApproval(selectedSeller.id, 'approve')}
                          className="flex items-center justify-center gap-2 py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-green-500/20"
                        >
                          <UserCheck size={16} strokeWidth={3} /> Approve
                        </button>
                        <button 
                          onClick={() => handleApproval(selectedSeller.id, 'reject')}
                          className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                        >
                          <UserX size={16} strokeWidth={3} /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className={`p-6 rounded-[2rem] border flex items-center gap-4 ${
                        selectedSeller.status === 'approved' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                      }`}>
                        <div className={`p-3 rounded-xl ${
                          selectedSeller.status === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {selectedSeller.status === 'approved' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <div>
                          <p className={`font-black uppercase text-xs tracking-tight ${
                            selectedSeller.status === 'approved' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            Account {selectedSeller.status}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                            Status verified by Admin
                          </p>
                        </div>
                        {/* Option to change status if needed */}
                        <button 
                          onClick={() => handleApproval(selectedSeller.id, selectedSeller.status === 'approved' ? 'reject' : 'approve')}
                          className="ml-auto text-[10px] font-black uppercase text-primary-dark hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Internal Note</h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                      Verify documents before approving. Ensure the National ID matches the seller names.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellerManagement;
