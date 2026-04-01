import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, Clock, User, Phone, Trash2, Wallet, Briefcase, TrendingUp, Upload, FileText } from 'lucide-react';

const CommissionManagement = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommission, setSelectedCommission] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCommissions = async () => {
    try {
      const response = await api.get('/admin/commissions');
      setCommissions(response.data.data);
    } catch (error) {
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handlePayClick = (comm: any) => {
    setSelectedCommission(comm);
    // Trigger file input after a small delay to ensure modal is ready or just use state
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCommission) return;

    const formData = new FormData();
    formData.append('payout_proof', file);

    setUploading(true);
    try {
      await api.patch(`/admin/commissions/${selectedCommission.id}/pay`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Payment proof uploaded successfully');
      setSelectedCommission(null);
      fetchCommissions();
    } catch (error) {
      toast.error('Failed to upload proof');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this commission record? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/commissions/${id}`);
        toast.success('Commission record deleted');
        fetchCommissions();
      } catch (error) {
        toast.error('Failed to delete commission');
      }
    }
  };

  const stats = useMemo(() => {
    return commissions.reduce((acc, curr) => {
        const amount = Number(curr.amount) || 0;
        if (curr.commission_type === 'system') acc.systemTotal += amount;
        if (curr.commission_type === 'agent') acc.agentTotal += amount;
        if (curr.commission_type === 'seller_payout') acc.sellerTotal += amount;
        // Pending = approved (awaiting payment) + paid (awaiting recipient confirmation)
        if (curr.status === 'approved' || curr.status === 'paid') acc.pendingTotal += amount;
        return acc;
    }, { systemTotal: 0, agentTotal: 0, sellerTotal: 0, pendingTotal: 0 });
  }, [commissions]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  const API_BASE_URL = ((import.meta as any).env.VITE_API_URL || '  https://rivers-rwanda.onrender.com/api/v1').replace('/api/v1', '');

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Commission Management</h1>
          <p className="text-text-light mt-1 font-medium">Track system earnings and manage payouts for sellers and agents.</p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf"
      />

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                <TrendingUp size={24} />
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">System Revenue</p>
                <p className="text-lg font-black text-primary-dark">Rwf {stats.systemTotal.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Briefcase size={24} />
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Agent Comm.</p>
                <p className="text-lg font-black text-primary-dark">Rwf {stats.agentTotal.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <User size={24} />
            </div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Seller Payouts</p>
                <p className="text-lg font-black text-primary-dark">Rwf {stats.sellerTotal.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-accent-orange p-6 rounded-[2rem] shadow-xl shadow-accent-orange/20 flex items-center gap-4 text-white">
            <div className="p-3 bg-white/20 text-white rounded-2xl">
                <Wallet size={24} />
            </div>
            <div>
                <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">Pending Total</p>
                <p className="text-lg font-black">Rwf {stats.pendingTotal.toLocaleString()}</p>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Recipient</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Type</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissions.length > 0 ? commissions.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.commission_type === 'system' ? 'bg-green-50 text-green-600' : 'bg-primary-dark/5 text-primary-dark'}`}>
                        {c.commission_type === 'system' ? <TrendingUp size={18}/> : <User size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-primary-dark text-sm uppercase tracking-tight">{c.first_name || 'System'} {c.last_name || ''}</p>
                        {c.phone_number && <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><Phone size={10}/> {c.phone_number}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        c.commission_type === 'agent' ? 'bg-purple-50 text-purple-600' : 
                        c.commission_type === 'seller_payout' ? 'bg-blue-50 text-blue-600' : 
                        'bg-green-50 text-green-600'
                    }`}>
                        {c.commission_type.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-primary-dark">Rwf {Number(c.amount).toLocaleString()}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Earned: {new Date(c.earned_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit border ${
                        c.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                        c.status === 'paid' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                        {c.status}
                        </span>
                        {c.payout_proof_path && (
                            <a 
                                href={`${API_BASE_URL}${c.payout_proof_path}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] text-accent-orange font-black uppercase flex items-center gap-1 hover:underline"
                            >
                                <FileText size={10}/> View Proof
                            </a>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-3">
                      {c.status === 'approved' && c.commission_type !== 'system' ? (
                        <button 
                          onClick={() => handlePayClick(c)}
                          disabled={uploading}
                          className="bg-primary-dark text-white hover:bg-black px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg"
                        >
                          <Upload size={14} /> {uploading ? 'Uploading...' : 'Pay & Upload Proof'}
                        </button>
                      ) : c.status === 'paid' ? (
                        <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest italic">
                            <Clock size={16} /> Awaiting Recipient Approval
                        </div>
                      ) : c.status === 'completed' ? (
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle size={16} /> Payout Completed
                        </div>
                      ) : null}
                      
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm opacity-40 hover:opacity-100"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">No commissions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionManagement;
