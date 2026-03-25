import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/logo.png';

const schema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['client', 'agent', 'seller']),
  nationalId: z.string().optional(),
}).refine(data => (data.role === 'agent' || data.role === 'seller') ? !!data.nationalId && data.nationalId.length >= 16 : true, {
  message: "A 16-digit National ID is required for agents and sellers",
  path: ["nationalId"],
});

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'client' } });
  const role = watch('role');

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (data.role === 'seller') {
        const [firstName, ...lastName] = data.fullName.split(' ');
        const sellerData = {
            firstName,
            lastName: lastName.join(' '),
            email: data.email,
            phoneNumber: data.phone,
            nationalId: data.nationalId,
            password: data.password
        }
        const response = await api.post('/sellers/register', sellerData);
        toast.success(response.data.message);
        navigate(`/verify-otp?email=${data.email}`);
      } else {
        const response = await api.post('/auth/register', data);
        toast.success(response.data.message);
        navigate(`/verify-email?userId=${response.data.data.userId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('auth.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center p-4 pt-24">
      <div className="max-w-xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
        <div className="text-center mb-10">
          <img src={logo} alt="Rivers Rwanda Logo" className="mx-auto h-24 w-auto" />
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter mt-4">{t('auth.registerTitle')}</h1>
          <p className="text-text-light font-medium mt-1">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">{t('auth.registerAs')}</label>
            <div className="grid grid-cols-3 gap-4">
                <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all text-center ${role === 'client' ? 'border-accent-orange bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" {...register('role')} value="client" className="hidden" />
                    <span className="font-bold text-primary-dark">{t('auth.client')}</span>
                </label>
                <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all text-center ${role === 'agent' ? 'border-accent-orange bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" {...register('role')} value="agent" className="hidden" />
                    <span className="font-bold text-primary-dark">{t('auth.agent')}</span>
                </label>
                <label className={`p-4 border-2 rounded-xl cursor-pointer transition-all text-center ${role === 'seller' ? 'border-accent-orange bg-orange-50' : 'border-gray-200'}`}>
                    <input type="radio" {...register('role')} value="seller" className="hidden" />
                    <span className="font-bold text-primary-dark">{t('auth.seller')}</span>
                </label>
            </div>
          </div>

          <div>
            <input {...register('fullName')} placeholder={t('contact.fullName')} className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
          </div>

          {(role === 'agent' || role === 'seller') && (
            <div>
                <input {...register('nationalId')} placeholder={t('auth.nationalIdPlaceholder')} className="w-full p-4 border-2 rounded-xl outline-none" />
                {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId.message as string}</p>}
            </div>
          )}

          <div>
            <input {...register('email')} placeholder={t('auth.emailLabel')} className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
          </div>
          <div>
            <input {...register('phone')} placeholder={t('auth.phoneLabel')} className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
          </div>
          <div>
            <input {...register('password')} type="password" placeholder={t('auth.passwordLabel')} className="w-full p-4 border-2 rounded-xl outline-none" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-accent-orange text-white font-bold py-4 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2">
            {loading ? t('auth.registering') : t('auth.register')} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          {t('auth.alreadyHaveAccount')} <Link to="/login" className="font-bold text-accent-orange">{t('auth.logIn')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
