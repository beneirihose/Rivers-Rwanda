import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { MailCheck } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!userId) {
      toast.error('No user specified for verification.');
      navigate('/register');
    }
  }, [userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { userId, otp });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const response = await api.post('/auth/resend-otp', { userId });
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
        <div className="text-center mb-10">
          <MailCheck className="mx-auto text-accent-orange" size={40} />
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mt-4">Verify Your Email</h1>
          <p className="text-text-light font-medium mt-1">Enter the OTP sent to your email address.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full p-4 border-2 rounded-xl outline-none text-center text-2xl font-bold tracking-[.5em]"
            />
          </div>

          <button type="submit" disabled={loading || resending} className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl uppercase tracking-widest">
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          Didn't receive an OTP? <button onClick={handleResendOtp} disabled={resending} className="font-bold text-accent-orange disabled:text-gray-400">{resending ? 'Sending...' : 'Resend OTP'}</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
