import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { LockKeyhole } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      toast.error('No email specified for password reset.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success(response.data.message);
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
        <div className="text-center mb-10">
          <LockKeyhole className="mx-auto text-accent-orange" size={40} />
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mt-4">Reset Your Password</h1>
          <p className="text-text-light font-medium mt-1">Enter the OTP from your email and create a new password.</p>
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
          <div>
            <input 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              placeholder="Enter new password"
              className="w-full p-4 border-2 rounded-xl outline-none"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl uppercase tracking-widest">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-8">
          Return to <Link to="/login" className="font-bold text-accent-orange">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
