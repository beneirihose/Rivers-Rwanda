import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ImageIcon, XCircle } from 'lucide-react';

const schema = z.object({
  purpose: z.enum(['rent', 'buy']),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.preprocess(val => Number(val), z.number().min(1990, 'Year must be 1990 or newer')),
  vehicle_type: z.enum(['sedan', 'suv', 'truck', 'van', 'luxury', 'other']),
  transmission: z.enum(['automatic', 'manual']),
  fuel_type: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  seating_capacity: z.preprocess(val => Number(val), z.number().min(1, 'Seating capacity is required')),
  daily_rate: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  sale_price: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  agreed_to_commission: z.boolean().refine(val => val === true, "You must agree to the commission terms."),
}).refine(data => {
    if (data.purpose === 'rent') return !!data.daily_rate;
    if (data.purpose === 'buy') return !!data.sale_price;
    return false;
}, {
    message: 'Price is required for the selected purpose',
    path: ['sale_price'],
});

type VehicleFormData = z.infer<typeof schema>;

const AddVehicleForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<VehicleFormData>({ 
    resolver: zodResolver(schema), 
    defaultValues: { 
      purpose: 'rent', 
      vehicle_type: 'sedan', 
      agreed_to_commission: false,
      transmission: 'automatic',
      fuel_type: 'petrol'
    } 
  });
  
  const purpose = watch('purpose');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 6) {
        toast.error('You can only upload up to 6 images.');
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const previews = useMemo(() => selectedFiles.map(file => URL.createObjectURL(file)), [selectedFiles]);

  const onSubmit = async (data: VehicleFormData) => {
    if (selectedFiles.length === 0) {
        toast.error('At least one image is required.');
        return;
    }

    setLoading(true);
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined) {
          formData.append(key, String(value));
        }
    });

    selectedFiles.forEach(file => {
        formData.append('images', file);
    });

    try {
      await api.post('/vehicles', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Vehicle listing submitted! Waiting for Admin approval.');
      navigate('/seller/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="mb-10">
            <h2 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">List New Vehicle</h2>
            <p className="text-text-light font-medium">Provide details about your vehicle for approval.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Purpose</label>
              <select {...register('purpose')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none">
                <option value="rent">For Rent</option>
                <option value="buy">For Sale</option>
              </select>
              {errors.purpose && <p className="text-red-500 text-[10px] font-bold">{errors.purpose.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Vehicle Type</label>
              <select {...register('vehicle_type')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none">
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="luxury">Luxury</option>
                <option value="other">Other</option>
              </select>
              {errors.vehicle_type && <p className="text-red-500 text-[10px] font-bold">{errors.vehicle_type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Make</label>
                <input {...register('make')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="e.g. Toyota" />
                {errors.make && <p className="text-red-500 text-[10px] font-bold">{errors.make.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Model</label>
                <input {...register('model')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="e.g. Land Cruiser" />
                {errors.model && <p className="text-red-500 text-[10px] font-bold">{errors.model.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Year</label>
                <input type="number" {...register('year')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50" />
                {errors.year && <p className="text-red-500 text-[10px] font-bold">{errors.year.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Transmission</label>
                <select {...register('transmission')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50">
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select>
                {errors.transmission && <p className="text-red-500 text-[10px] font-bold">{errors.transmission.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Fuel Type</label>
                <select {...register('fuel_type')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50">
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                </select>
                {errors.fuel_type && <p className="text-red-500 text-[10px] font-bold">{errors.fuel_type.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400">Seating</label>
                <input type="number" {...register('seating_capacity')} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50" />
                {errors.seating_capacity && <p className="text-red-500 text-[10px] font-bold">{errors.seating_capacity.message}</p>}
            </div>
          </div>

          <div className="p-8 bg-orange-50/50 rounded-[2rem] border border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {purpose === 'rent' ? (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary-dark">Daily Rate (Rwf)</label>
                        <input type="number" {...register('daily_rate')} className="w-full p-4 border-2 border-white rounded-2xl font-bold" placeholder="0.00" />
                        {errors.daily_rate && <p className="text-red-500 text-[10px] font-bold">{errors.daily_rate.message}</p>}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary-dark">Sale Price (Rwf)</label>
                        <input type="number" {...register('sale_price')} className="w-full p-4 border-2 border-white rounded-2xl font-bold" placeholder="0.00" />
                        {errors.sale_price && <p className="text-red-500 text-[10px] font-bold">{errors.sale_price.message}</p>}
                    </div>
                )}
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Gallery (Up to 6 Images)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previews.map((src, i) => (
                    <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-accent-orange shadow-sm group">
                        <img src={src} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <XCircle size={16} />
                        </button>
                    </div>
                ))}
                {selectedFiles.length < 6 && (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-4 border-dashed border-gray-100 bg-gray-50 cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-gray-400 hover:text-accent-orange">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                        <ImageIcon size={32} />
                        <span className="text-[9px] font-black uppercase mt-2">Add Image</span>
                    </label>
                )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <input type="checkbox" {...register('agreed_to_commission')} id="commission" className="h-5 w-5 rounded-lg border-2 border-gray-300 text-accent-orange focus:ring-accent-orange transition-all" />
            <label htmlFor="commission" className="text-xs font-bold text-gray-600 uppercase tracking-tight">I agree to pay a 10% commission to the system owner upon successful sale/rent.</label>
          </div>
          {errors.agreed_to_commission && <p className="text-red-500 text-[10px] font-bold -mt-6 ml-2">{errors.agreed_to_commission.message}</p>}

          <button type="submit" disabled={loading} className="w-full bg-primary-dark text-white font-black py-6 rounded-3xl uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50">
            {loading ? 'Processing...' : 'Submit Vehicle for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleForm;
