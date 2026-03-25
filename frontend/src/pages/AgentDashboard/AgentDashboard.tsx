import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Copy, Users, Wallet, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const AgentDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ paid: 0, approved: 0, pending: 0 });
  const [referralCode, setReferralCode] = useState('');
  const [recentClients, setRecentClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const [statsRes, codeRes, clientsRes] = await Promise.all([
          api.get('/agents/stats'),
          api.get('/agents/referral-code'),
          api.get('/agents/clients')
        ]);
        
        const backendStats = statsRes.data.data || {};
        setStats({
          paid: backendStats.paid || 0,
          approved: backendStats.approved || 0,
          pending: backendStats.pending || 0
        });
        
        setReferralCode(codeRes.data.data.referral_code);
        setRecentClients(clientsRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching agent data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgentData();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success(t('dashboard.agent.codeCopied'));
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8 pt-40 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">{t('dashboard.agent.title')}</h1>
          <p className="text-text-light mt-1 font-medium">{t('dashboard.agent.subtitle')}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 w-full md:w-auto">
          <div className="flex-grow">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('dashboard.agent.referralCode')}</p>
            <p className="text-xl font-mono font-bold text-accent-orange tracking-widest">{referralCode || 'N/A'}</p>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-accent-orange hover:text-white transition-all"
            title={t('dashboard.agent.copyCode')}
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('dashboard.agent.commissions.paid')}</p>
            <p className="text-2xl font-black text-primary-dark tracking-tighter">Rwf {(stats.paid || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('dashboard.agent.commissions.approved')}</p>
            <p className="text-2xl font-black text-primary-dark tracking-tighter">Rwf {(stats.approved || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-200/40 border border-gray-50 flex items-center gap-5 hover:shadow-xl transition-all duration-300">
          <div className="p-4 bg-orange-50 text-accent-orange rounded-2xl">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('dashboard.agent.commissions.pending')}</p>
            <p className="text-2xl font-black text-primary-dark tracking-tighter">Rwf {(stats.pending || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-accent-orange" />
            <h2 className="text-xl font-black text-primary-dark uppercase tracking-tighter">{t('dashboard.agent.recentClients.title')}</h2>
          </div>
          <button className="text-accent-orange font-black text-[10px] uppercase tracking-widest hover:underline">{t('dashboard.agent.recentClients.viewAll')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">{t('dashboard.agent.recentClients.table.name')}</th>
                <th className="px-8 py-5">{t('dashboard.agent.recentClients.table.email')}</th>
                <th className="px-8 py-5">{t('dashboard.agent.recentClients.table.referredOn')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {recentClients.map((client, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-primary-dark uppercase text-sm tracking-tight">{client.first_name} {client.last_name}</td>
                  <td className="px-8 py-6 text-sm text-text-light">{client.email}</td>
                  <td className="px-8 py-6 text-sm text-text-light">{new Date(client.referred_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentClients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-text-light italic font-medium">{t('dashboard.agent.recentClients.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
