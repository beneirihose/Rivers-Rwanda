import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle2, Clock, Check, X, FileText, ExternalLink, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const SellerEarnings = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProofModal, setShowProofModal] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      const response = await api.get('/sellers/earnings');
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
    if (!window.confirm("Confirm that you have received this payout?")) return;
    try {
      await api.patch(`/sellers/commissions/${id}/confirm-receipt`);
      toast.success('Payout receipt confirmed! Thank you.');
      fetchEarnings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleRejectReceipt = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this payout? The admin will be notified to correct it.")) return;
    try {
      await api.patch(`/sellers/commissions/${id}/reject-receipt`);
      toast.success('Payout rejected. Admin has been notified.');
      fetchEarnings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  const API_BASE_URL = ((import.meta as any).env.VITE_API_URL || '  https://rivers-rwanda.onrender.com/api/v1').replace('/api/v1', '');
  const totalReceived = commissions.reduce((acc, curr) => acc + (curr.status === 'completed' ? Number(curr.amount) : 0), 0);
  // Pending = only 'paid' (money sent but not yet confirmed) — 'approved' is still being processed by admin
  const pendingPayout = commissions.reduce((acc, curr) => acc + (curr.status === 'paid' ? Number(curr.amount) : 0), 0);
  const awaitingProcessing = commissions.reduce((acc, curr) => acc + (curr.status === 'approved' ? Number(curr.amount) : 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Property Earnings</h1>
          <p className="text-text-light mt-1 font-medium">Track your income and payout history from property bookings.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Received</span>
            <span className="text-lg font-black text-green-600 tracking-tighter">Rwf {totalReceived.toLocaleString()}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Payout</span>
            <span className="text-lg font-black text-accent-orange tracking-tighter">Rwf {pendingPayout.toLocaleString()}</span>
          </div>
          {awaitingProcessing > 0 && (
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-orange-100 flex flex-col">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Processing</span>
              <span className="text-lg font-black text-orange-500 tracking-tighter">Rwf {awaitingProcessing.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Transaction Date</th>
                <th className="px-8 py-6">Payout Amount (90%)</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Payment Proof</th>
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
                    <span className="text-sm font-black text-primary-dark">Rwf {Number(comm.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                      comm.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                      comm.status === 'paid' ? 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {comm.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {comm.status === 'paid' ? 'FUNDS SENT - VERIFY' : comm.status === 'approved' ? 'AWAITING PAYMENT' : comm.status}
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
                        <span className="text-[10px] text-gray-400 italic font-bold uppercase tracking-tighter">Admin Processing...</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      {comm.status === 'paid' && (
                        <>
                            <button 
                                onClick={() => handleConfirmReceipt(comm.id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                            >
                                <Check size={14} strokeWidth={3} /> Approve Receipt
                            </button>
                            <button 
                                onClick={() => handleRejectReceipt(comm.id)}
                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Reject Payout"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        </>
                      )}
                      {comm.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle2 size={16} /> Completed
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <TrendingUp size={48} />
                      <p className="text-lg font-bold text-text-light italic tracking-tight">No payout history found.</p>
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
                            <FileText className="text-accent-orange" /> Payout Receipt
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
                        <p className="text-xs text-text-light font-medium italic">Please verify the amount and transaction details before confirming receipt.</p>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerEarnings;
