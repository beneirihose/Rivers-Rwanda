import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { MailCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VerifyOtp = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error(t('auth.noEmailSpecified'));
      navigate('/');
    }
  }, [email, navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/sellers/verify-otp', { email, otpCode: otp });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
        <div className="text-center mb-10">
          <MailCheck className="mx-auto text-accent-orange" size={40} />
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mt-4">{t('auth.verifyAccount')}</h1>
          <p className="text-text-light font-medium mt-1">{t('auth.enterOtp')} <strong>{email}</strong>.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={t('auth.otpPlaceholder')}
              maxLength={6}
              className="w-full p-4 border-2 rounded-xl outline-none text-center text-2xl font-bold tracking-[.5em]"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl uppercase tracking-widest">
            {loading ? t('auth.verifying') : t('auth.verifyBtn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
