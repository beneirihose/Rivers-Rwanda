import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Check, X, ShieldCheck, Mail, Phone, Briefcase, Users, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AgentManagement = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'pending' ? '/admin/agents/pending' : '/admin/agents';
      const response = await api.get(endpoint);
      setAgents(response.data.data);
    } catch (error) {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [activeTab]);

  const handleApproval = async (id: string, approve: boolean) => {
    try {
      const endpoint = approve ? `/admin/agents/${id}/approve` : `/admin/agents/${id}/reject`;
      await api.patch(endpoint);
      toast.success(approve ? 'Agent approved successfully' : 'Agent application rejected');
      fetchAgents();
    } catch (error) {
      toast.error('Action failed. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tight">Agent Management</h1>
          <p className="text-text-light mt-1 font-medium">Manage and verify platform agents and their commissions.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white text-accent-orange shadow-sm' : 'text-gray-500 hover:text-primary-dark'}`}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} />
              Pending Verification
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-accent-orange shadow-sm' : 'text-gray-500 hover:text-primary-dark'}`}
          >
            <div className="flex items-center gap-2">
              <Users size={14} />
              All Agents
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Professional Profile</th>
                <th className="px-6 py-5">Contact Details</th>
                <th className="px-6 py-5">National ID</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence mode='wait'>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-orange"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Synchronizing Data...</span>
                      </div>
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Users size={40} strokeWidth={1} />
                        <p className="text-sm font-medium italic">No {activeTab} agents found at this time.</p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  agents.map((agent, index) => (
                    <motion.tr 
                      key={agent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-accent-orange font-black text-lg border border-orange-100 group-hover:scale-110 transition-transform">
                              {agent.first_name[0]}{agent.last_name[0]}
                            </div>
                            {agent.status === 'approved' && (
                              <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                                <ShieldCheck size={16} className="text-green-500 fill-green-50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-primary-dark uppercase text-sm">{agent.first_name} {agent.last_name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Briefcase size={10} className="text-gray-400" />
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                {agent.business_name || 'Independent Agent'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-text-light">
                            <Mail size={12} className="text-accent-orange/60" />
                            <span>{agent.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-text-light">
                            <Phone size={12} className="text-accent-orange/60" />
                            <span>{agent.phone_number}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-primary-dark tracking-wider">{agent.national_id || 'N/A'}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-black">Applied: {new Date(agent.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {agent.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleApproval(agent.id, true)}
                                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl transition-all shadow-lg shadow-green-200 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                              >
                                <Check size={14} strokeWidth={3} /> Approve
                              </button>
                              <button 
                                onClick={() => handleApproval(agent.id, false)}
                                className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-100"
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <button className="px-4 py-2 bg-gray-100 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                                Verified
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-accent-orange/5 border border-accent-orange/10 rounded-[2rem] p-8 flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          <Shield className="text-accent-orange" size={24} />
        </div>
        <div>
          <h4 className="font-black text-primary-dark uppercase text-sm tracking-tight">Agent Privileges</h4>
          <p className="text-xs text-text-light mt-1 font-medium max-w-2xl leading-relaxed">
            Approved agents are permitted to process bookings on behalf of clients. For every successfully verified payment, 
            the system automatically credits the agent with a <span className="text-accent-orange font-bold">3% commission fee</span>. 
            Ensure all National ID details are verified before approval.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;
