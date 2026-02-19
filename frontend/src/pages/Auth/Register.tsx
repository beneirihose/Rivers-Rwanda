import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'agent']),
  nationalId: z.string().optional(),
}).refine(data => data.role === 'agent' ? !!data.nationalId && data.nationalId.length >= 16 : true, {
  message: "A 16-digit National ID is required for agents",
  path: ["nationalId"],
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'client' } });
  const role = watch('role');

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      toast.success(response.data.message);
      // Redirect to the new OTP verification page
      navigate(`/verify-email?userId=${response.data.data.userId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4 pt-24">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
        <div className="text-center mb-10">
          <UserPlus className="mx-auto text-accent-orange" size={40} />
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mt-4">Create Your Account</h1>
          <p className="text-text-light font-medium mt-1">Join the Rivers Rwanda community.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Register As</label>
            <div className="flex gap-4">
                <label className="flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'client' ? 'border-accent-orange bg-orange-50' : 'border-gray-200'}">
                    <input type="radio" {...register('role')} value="client" className="hidden" />
                    <span className="font-bold text-primary-dark">Client</span>
                </label>
                <label className="flex-1 p-4 border-2 rounded-xl cursor-pointer transition-all ${role === 'agent' ? 'border-accent-orange bg-orange-50' : 'border-gray-200'}">
                    <input type="radio" {...register('role')} value="agent" className="hidden" />
                    <span className="font-bold text-primary-dark">Agent</span>
                </label>
            </div>
          </div>

          <div>
            <input {...register('fullName')} placeholder="Full Name" className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
          </div>

          {role === 'agent' && (
            <div>
                <input {...register('nationalId')} placeholder="National ID (16 digits)" className="w-full p-4 border-2 rounded-xl outline-none" />
                {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId.message as string}</p>}
            </div>
          )}

          <div>
            <input {...register('email')} placeholder="Email Address" className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
          </div>
          <div>
            <input {...register('phone')} placeholder="Phone Number" className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
          </div>
          <div>
            <input {...register('password')} type="password" placeholder="Password" className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2">
            {loading ? 'Registering...' : 'Register'} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account? <Link to="/login" className="font-bold text-accent-orange">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
