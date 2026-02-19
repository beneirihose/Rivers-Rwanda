import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success(response.data.message);
      // Redirect to reset password page, passing email along
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
        <div className="text-center mb-10">
          <KeyRound className="mx-auto text-accent-orange" size={40} />
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mt-4">Forgot Password</h1>
          <p className="text-text-light font-medium mt-1">Enter your email to receive a password reset OTP.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email address"
              className="w-full p-4 border-2 rounded-xl outline-none"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl uppercase tracking-widest">
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Remember your password? <Link to="/login" className="font-bold text-accent-orange">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
