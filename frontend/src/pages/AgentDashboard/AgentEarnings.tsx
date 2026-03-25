import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle2, Clock, TrendingUp, Check, X, Trash2, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AgentEarnings = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProofModal, setShowProofModal] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      const response = await api.get('/agents/commissions');
      setCommissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching earnings', error);
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleConfirmReceipt = async (id: string) => {
    if (!window.confirm("Confirm that you have received this payment?")) return;
    try {
      await api.patch(`/agents/commissions/${id}/confirm-receipt`);
      toast.success('Payout receipt confirmed!');
      fetchEarnings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleRejectReceipt = async (id: string) => {
    const reason = window.prompt("Please enter the reason for rejection (e.g., amount mismatch, proof is unreadable):");
    if (reason === null) return;
    try {
      await api.patch(`/agents/commissions/${id}/reject-receipt`, { reason });
      toast.success('Payout rejected. Admin will be notified.');
      fetchEarnings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this record from your view?")) return;
    try {
      await api.delete(`/agents/commissions/${id}`);
      toast.success('Record removed');
      fetchEarnings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  const API_BASE_URL = ((import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
  const totalEarned = commissions.reduce((acc, curr) => acc + (curr.status === 'completed' ? Number(curr.amount) : 0), 0);
  const pendingPayout = commissions.reduce((acc, curr) => acc + (curr.status === 'approved' || curr.status === 'paid' ? Number(curr.amount) : 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Earnings & Commissions</h1>
          <p className="text-text-light mt-1 font-medium">Track your performance and payout history.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Earned</span>
            <span className="text-lg font-black text-green-600 tracking-tighter">Rwf {totalEarned.toLocaleString()}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Payout</span>
            <span className="text-lg font-black text-accent-orange tracking-tighter">Rwf {pendingPayout.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Transaction Date</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Payout Proof</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {commissions.map((comm, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={comm.id} 
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-primary-dark font-black">
                            <Calendar size={14} className="text-gray-300" />
                            {new Date(comm.earned_at).toLocaleDateString()}
                        </div>
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Ref: {comm.id.substring(0,8)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-primary-dark">Rwf {comm.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                      comm.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                      comm.status === 'paid' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {comm.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {comm.status === 'paid' ? 'PAID - VERIFY NOW' : comm.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {comm.payout_proof_path ? (
                        <button 
                            onClick={() => setShowProofModal(`${API_BASE_URL}${comm.payout_proof_path}`)}
                            className="flex items-center gap-2 text-[10px] font-black text-accent-orange uppercase hover:underline"
                        >
                            <FileText size={14} /> View Receipt
                        </button>
                    ) : (
                        <span className="text-[10px] text-gray-400 italic font-bold uppercase tracking-tighter">Processing...</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      {comm.status === 'paid' && (
                        <>
                            <button 
                                onClick={() => handleConfirmReceipt(comm.id)}
                                className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100"
                                title="Approve Receipt"
                            >
                                <Check size={16} strokeWidth={3} />
                            </button>
                            <button 
                                onClick={() => handleRejectReceipt(comm.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                title="Reject Payout"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteRecord(comm.id)}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <TrendingUp size={48} />
                      <p className="text-lg font-bold text-text-light italic tracking-tight">No commission history found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PROOF MODAL --- */}
      <AnimatePresence>
        {showProofModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowProofModal(null)}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-black text-primary-dark uppercase tracking-tight flex items-center gap-2">
                            <FileText className="text-accent-orange" /> Payout Proof of Payment
                        </h3>
                        <div className="flex gap-2">
                            <a href={showProofModal} target="_blank" rel="noreferrer" className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-accent-orange transition-colors">
                                <ExternalLink size={20} />
                            </a>
                            <button onClick={() => setShowProofModal(null)} className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-100 p-4 flex justify-center items-center">
                        {showProofModal.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={showProofModal} title="Proof PDF" className="w-full h-full min-h-[600px]" />
                        ) : (
                            <img src={showProofModal} alt="Payout Proof" className="max-w-full h-auto rounded-lg shadow-sm" />
                        )}
                    </div>
                    <div className="p-6 bg-white flex justify-center gap-4 border-t border-gray-100">
                        <p className="text-xs text-text-light font-medium italic">Please verify all details on the receipt before approving.</p>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentEarnings;
