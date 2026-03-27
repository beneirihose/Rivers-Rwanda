import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Wifi, Car, TreePine, X, Image as ImageIcon, MapPin, Ruler, BedDouble, Bath, Layout, Construction, Home, Zap, Droplets, Grid3X3 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  province: z.string().min(1, 'Province is required'),
  district: z.string().min(1, 'District is required'),
  sector: z.string().min(1, 'Sector is required'),
  full_address: z.string().min(5, 'Please provide a more detailed address'),
  size_sqm: z.preprocess(val => Number(val), z.number().positive('Size is required')),
  bedrooms: z.preprocess(val => Number(val), z.number().min(1, 'At least one bedroom')),
  bathrooms: z.preprocess(val => Number(val), z.number().min(1, 'At least one bathroom')),
  balconies: z.preprocess(val => Number(val), z.number().min(0).optional()),
  total_rooms: z.preprocess(val => Number(val), z.number().min(1, 'Total rooms is required')),
  kitchen_type: z.enum(['inside', 'outside', 'both']),
  toilet_type: z.enum(['inside', 'outside', 'both']),
  material_used: z.enum(['block_sima', 'ruriba', 'mpunyu', 'rukarakara', 'other']),
  ceiling_type: z.enum(['plafond', 'roof', 'none']),
  has_tiles: z.boolean().optional(),
  has_electricity: z.boolean().optional(),
  has_water: z.boolean().optional(),
  has_parking: z.boolean().optional(),
  has_garden: z.boolean().optional(),
  has_wifi: z.boolean().optional(),
  purchase_price: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  monthly_rent_price: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  purpose: z.enum(['rent', 'sale', 'both']),
  images: z.any().refine(files => files?.length > 0, 'At least one image is required.'),
  agreed_to_commission: z.boolean().refine(val => val === true, "You must agree to terms."),
}).refine(data => {
    if (data.purpose === 'rent') return !!data.monthly_rent_price;
    if (data.purpose === 'sale') return !!data.purchase_price;
    if (data.purpose === 'both') return !!data.monthly_rent_price && !!data.purchase_price;
    return false;
}, {
    message: 'Price is required for the selected purpose',
    path: ['purchase_price'],
});

type HouseFormData = z.infer<typeof schema>;

const AddHouseForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HouseFormData>({ 
    resolver: zodResolver(schema), 
    defaultValues: { 
        purpose: 'rent',
        kitchen_type: 'inside',
        toilet_type: 'inside',
        material_used: 'block_sima',
        ceiling_type: 'plafond',
        has_electricity: true,
        has_water: true,
        has_tiles: false,
        images: null as any
    } 
  });
  
  const purpose = watch('purpose');
  const selectedImages = watch('images') as FileList | null;

  useEffect(() => {
    if (selectedImages && selectedImages.length > 0) {
      const previews = Array.from(selectedImages).map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
      return () => previews.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [selectedImages]);

  const onSubmit = async (data: HouseFormData) => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      const value = (data as any)[key];
      if (key === 'images' && value) {
        for (let i = 0; i < value.length; i++) formData.append('images', value[i]);
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    try {
      await api.post('/houses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('House listed successfully! Pending approval.');
      navigate('/seller/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-white p-8 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100">
        <div className="space-y-2 border-b border-gray-100 pb-8">
            <h2 className="text-4xl font-black text-primary-dark uppercase tracking-tighter">List New House</h2>
            <p className="text-gray-500 font-medium">Specify details for rent or sale.</p>
        </div>

        {/* Basic Info & Purpose */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Listing Purpose</label>
                <select {...register('purpose')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark bg-gray-50 outline-none focus:border-accent-orange transition-all appearance-none">
                    <option value="rent">For Rent Only</option>
                    <option value="sale">For Sale Only</option>
                    <option value="both">Both (Rent & Sale)</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property Title</label>
                <input {...register('title')} placeholder="e.g. Modern Villa in Rebero" className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark bg-gray-50 outline-none focus:border-accent-orange" />
                {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.title.message}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detailed Description</label>
            <textarea {...register('description')} rows={4} placeholder="Describe the house, neighborhood, and unique features..." className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark bg-gray-50 outline-none focus:border-accent-orange"></textarea>
            {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.description.message}</p>}
        </div>

        {/* Location Section */}
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-accent-orange" />
                <h3 className="text-sm font-black uppercase tracking-widest text-primary-dark">Location & Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <input {...register('province')} placeholder="Province" className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none" />
                    {errors.province && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.province.message}</p>}
                </div>
                <div className="space-y-1">
                    <input {...register('district')} placeholder="District" className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none" />
                    {errors.district && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.district.message}</p>}
                </div>
                <div className="space-y-1">
                    <input {...register('sector')} placeholder="Sector" className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none" />
                    {errors.sector && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.sector.message}</p>}
                </div>
            </div>
            <input {...register('full_address')} placeholder="Full Detailed Address (e.g. Street Number, Landmark)" className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold bg-gray-50 outline-none focus:border-accent-orange" />
            {errors.full_address && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.full_address.message}</p>}
        </div>

        {/* Structural Details */}
        <div className="space-y-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-2">
                <Construction size={18} className="text-accent-orange" />
                <h3 className="text-sm font-black uppercase tracking-widest text-primary-dark">Structural Specifications</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400">Size (SQM)</label>
                    <div className="relative">
                        <input type="number" {...register('size_sqm')} className="w-full p-4 pl-12 border-2 border-white rounded-2xl font-bold text-primary-dark" />
                        <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                    {errors.size_sqm && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.size_sqm.message}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400">Kitchen Location</label>
                    <select {...register('kitchen_type')} className="w-full p-4 border-2 border-white rounded-2xl font-bold">
                        <option value="inside">Inside Only</option>
                        <option value="outside">Outside Only</option>
                        <option value="both">Both Inside & Outside</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400">Toilet Location</label>
                    <select {...register('toilet_type')} className="w-full p-4 border-2 border-white rounded-2xl font-bold">
                        <option value="inside">Inside Only</option>
                        <option value="outside">Outside Only</option>
                        <option value="both">Both Inside & Outside</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400">Construction Material</label>
                    <select {...register('material_used')} className="w-full p-4 border-2 border-white rounded-2xl font-bold">
                        <option value="block_sima">Block Sima</option>
                        <option value="ruriba">Ruriba</option>
                        <option value="mpunyu">Mpunyu</option>
                        <option value="rukarakara">Rukarakara</option>
                        <option value="other">Other Material</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400">Ceiling/Roof Type</label>
                    <select {...register('ceiling_type')} className="w-full p-4 border-2 border-white rounded-2xl font-bold">
                        <option value="plafond">Plafond (Ceiling)</option>
                        <option value="roof">Roof Only</option>
                        <option value="none">None</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Room Counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { label: 'Bedrooms', name: 'bedrooms', icon: <BedDouble size={20}/> },
                { label: 'Bathrooms', name: 'bathrooms', icon: <Bath size={20}/> },
                { label: 'Balconies', name: 'balconies', icon: <Layout size={20}/> },
                { label: 'Total Rooms', name: 'total_rooms', icon: <Home size={20}/> },
            ].map(room => (
                <div key={room.name} className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400">{room.label}</label>
                    <div className="relative">
                        <input type="number" {...register(room.name as any)} className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark" />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-orange">{room.icon}</div>
                    </div>
                    {(errors as any)[room.name] && <p className="text-red-500 text-[10px] font-bold uppercase">{(errors as any)[room.name].message}</p>}
                </div>
            ))}
        </div>

        {/* Pricing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100">
            {(purpose === 'rent' || purpose === 'both') && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark">Monthly Rent (RWF)</label>
                    <input type="number" {...register('monthly_rent_price')} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-primary-dark outline-none focus:border-accent-orange shadow-sm" />
                    {errors.monthly_rent_price && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.monthly_rent_price.message}</p>}
                </div>
            )}
            {(purpose === 'sale' || purpose === 'both') && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark">Purchase Price (RWF)</label>
                    <input type="number" {...register('purchase_price')} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-primary-dark outline-none focus:border-accent-orange shadow-sm" />
                    {errors.purchase_price && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.purchase_price.message}</p>}
                </div>
            )}
        </div>

        {/* Features & Amenities */}
        <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Features & Facilities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { id: 'has_tiles', label: 'Tiles', icon: <Grid3X3 size={20}/> },
                    { id: 'has_electricity', label: 'Electricity', icon: <Zap size={20}/> },
                    { id: 'has_water', label: 'Water', icon: <Droplets size={20}/> },
                    { id: 'has_parking', label: 'Parking', icon: <Car size={20}/> },
                    { id: 'has_garden', label: 'Garden', icon: <TreePine size={20}/> },
                    { id: 'has_wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                ].map(feat => (
                    <label key={feat.id} className="cursor-pointer group">
                        <input type="checkbox" {...register(feat.id as any)} className="hidden" />
                        <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${watch(feat.id as any) ? 'bg-accent-orange border-accent-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            {feat.icon}
                            <span className="text-[9px] font-black uppercase tracking-widest text-center">{feat.label}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>

        {/* Image Gallery Preview */}
        <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">House Photos (Max 6)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => {
                            const dt = new DataTransfer();
                            if (selectedImages) {
                              for (let i = 0; i < selectedImages.length; i++) if (i !== idx) dt.items.add(selectedImages[i]);
                              setValue('images', dt.files);
                            }
                        }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                    </div>
                ))}
                {imagePreviews.length < 6 && (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-4 border-dashed border-gray-100 bg-gray-50 cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-gray-400 hover:text-accent-orange">
                        <input type="file" multiple accept="image/*" onChange={(e) => {
                            const dt = new DataTransfer();
                            if (selectedImages) for (let i = 0; i < selectedImages.length; i++) dt.items.add(selectedImages[i]);
                            if (e.target.files) for (let i = 0; i < e.target.files.length; i++) if (dt.items.length < 6) dt.items.add(e.target.files[i]);
                            setValue('images', dt.files);
                        }} className="hidden" />
                        <ImageIcon size={32} />
                        <span className="text-[9px] font-black uppercase mt-2">Add Photo</span>
                    </label>
                )}
            </div>
            {errors.images && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.images.message as string}</p>}
        </div>

        {/* Terms */}
        <div className="p-8 bg-orange-50 rounded-[2.5rem] border border-orange-100 flex items-start gap-4">
            <input type="checkbox" {...register('agreed_to_commission')} id="commission" className="mt-1 h-5 w-5 text-accent-orange cursor-pointer rounded"/>
            <div className="space-y-1">
                <label htmlFor="commission" className="text-sm font-bold text-primary-dark uppercase tracking-tight cursor-pointer">Agree to Terms</label>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">I agree to pay a 10% commission fee to Rivers Rwanda upon successful sale or rent.</p>
                {errors.agreed_to_commission && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.agreed_to_commission.message}</p>}
            </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary-dark text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all duration-500 shadow-2xl disabled:bg-gray-300 active:scale-95">
            {loading ? 'Processing House Listing...' : 'Submit House for Approval'}
        </button>
        </form>
    </div>
  );
};

export default AddHouseForm;
