import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  Search, 
  Filter, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const fetchInquiries = async () => {
    try {
      const response = await api.get('/contact');
      const data = response.data.data || [];
      setInquiries(data);
      setFilteredInquiries(data);
    } catch (error) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    let result = inquiries;
    if (searchTerm) {
      result = result.filter(i => 
        i.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }
    setFilteredInquiries(result);
  }, [searchTerm, statusFilter, inquiries]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      toast.success(`Inquiry marked as ${status.replace('_', ' ')}`);
      fetchInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReplyEmail = (inquiry: any) => {
    const subject = encodeURIComponent(`RE: ${inquiry.subject} - Rivers Rwanda`);
    window.location.href = `mailto:${inquiry.email}?subject=${subject}`;
    if (inquiry.status === 'new') handleStatusUpdate(inquiry.id, 'in_progress');
  };

  const handleWhatsApp = (inquiry: any) => {
    let phone = inquiry.phone_number.replace(/\D/g, '');
    if (!phone.startsWith('250')) phone = '250' + phone;
    const text = encodeURIComponent(`Hello ${inquiry.full_name}, this is Rivers Rwanda regarding your inquiry about "${inquiry.subject}".`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    if (inquiry.status === 'new') handleStatusUpdate(inquiry.id, 'in_progress');
  };

  const handleSMS = (inquiry: any) => {
    window.location.href = `sms:${inquiry.phone_number}`;
    if (inquiry.status === 'new') handleStatusUpdate(inquiry.id, 'in_progress');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter leading-none">Contact Inquiries</h1>
          <p className="text-text-light mt-1 font-medium">Manage and respond to customer messages across all channels.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Inquiries</span>
            <span className="text-xl font-black text-accent-orange tracking-tighter">{inquiries.filter(i => i.status === 'new').length}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Progress</span>
            <span className="text-xl font-black text-blue-600 tracking-tighter">{inquiries.filter(i => i.status === 'in_progress').length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or subject..."
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
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inquiries List */}
        <div className={`${selectedInquiry ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-50">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Sender</th>
                    <th className="px-8 py-6">Subject & Preview</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium text-sm">
                  {filteredInquiries.map((inquiry) => (
                    <tr 
                      key={inquiry.id} 
                      onClick={() => setSelectedInquiry(inquiry)}
                      className={`cursor-pointer transition-all ${selectedInquiry?.id === inquiry.id ? 'bg-orange-50/50' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg ${
                            inquiry.status === 'new' ? 'bg-accent-orange' : 'bg-primary-dark opacity-40'
                          }`}>
                            {inquiry.full_name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-primary-dark uppercase tracking-tight leading-none">{inquiry.full_name}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{inquiry.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-primary-dark uppercase text-[11px] tracking-tight">{inquiry.subject}</p>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{inquiry.message}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                          inquiry.status === 'new' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          inquiry.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            inquiry.status === 'new' ? 'bg-orange-500 animate-pulse' : 
                            inquiry.status === 'in_progress' ? 'bg-blue-500' : 
                            'bg-green-500'
                          }`}></div>
                          {inquiry.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          <button 
                            className={`p-3 rounded-xl transition-all ${
                              selectedInquiry?.id === inquiry.id ? 'bg-accent-orange text-white shadow-lg shadow-accent-orange/20' : 'bg-gray-100 text-gray-400 hover:bg-primary-dark hover:text-white'
                            }`}
                          >
                            <MessageSquare size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInquiries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                          <MessageSquare size={64} strokeWidth={1} />
                          <p className="text-sm font-black uppercase tracking-widest">No matching inquiries</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Reply Panel */}
        <AnimatePresence>
          {selectedInquiry && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-5"
            >
              <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden sticky top-32 flex flex-col max-h-[calc(100vh-200px)]">
                <div className="p-8 bg-primary-dark text-white relative">
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent-orange flex items-center justify-center font-black text-2xl text-white shadow-xl">
                      {selectedInquiry.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{selectedInquiry.full_name}</h3>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">Sender Profile</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 bg-white/5 p-2 rounded-xl border border-white/5">
                      <Phone size={14} className="text-accent-orange" />
                      {selectedInquiry.phone_number || 'No Phone'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 bg-white/5 p-2 rounded-xl border border-white/5">
                      <Mail size={14} className="text-accent-orange" />
                      {selectedInquiry.email}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Message Inquiry</h4>
                      <span className="text-[10px] font-bold text-gray-300 uppercase">{new Date(selectedInquiry.created_at).toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                      <p className="font-black text-primary-dark uppercase text-xs mb-3 tracking-tight">{selectedInquiry.subject}</p>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium italic">"{selectedInquiry.message}"</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Response Channels</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => handleWhatsApp(selectedInquiry)}
                        className="flex flex-col items-center gap-2 p-4 bg-green-50 text-green-600 rounded-3xl hover:bg-green-600 hover:text-white transition-all group"
                      >
                        <MessageCircle size={24} />
                        <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                      </button>
                      <button 
                        onClick={() => handleReplyEmail(selectedInquiry)}
                        className="flex flex-col items-center gap-2 p-4 bg-blue-50 text-blue-600 rounded-3xl hover:bg-blue-600 hover:text-white transition-all group"
                      >
                        <Mail size={24} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                      </button>
                      <button 
                        onClick={() => handleSMS(selectedInquiry)}
                        className="flex flex-col items-center gap-2 p-4 bg-purple-50 text-purple-600 rounded-3xl hover:bg-purple-600 hover:text-white transition-all group"
                      >
                        <ExternalLink size={24} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Direct SMS</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Internal Status</h4>
                    <div className="flex gap-2">
                      {selectedInquiry.status !== 'resolved' ? (
                        <button 
                          onClick={() => handleStatusUpdate(selectedInquiry.id, 'resolved')}
                          className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} /> Mark as Resolved
                        </button>
                      ) : (
                        <div className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} /> Inquiry Resolved
                        </div>
                      )}
                      {selectedInquiry.status === 'resolved' && (
                        <button 
                           onClick={() => handleStatusUpdate(selectedInquiry.id, 'in_progress')}
                           className="px-6 py-4 bg-gray-50 text-primary-dark rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                        >
                           Reopen
                        </button>
                      )}
                    </div>
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

export default InquiryManagement;
