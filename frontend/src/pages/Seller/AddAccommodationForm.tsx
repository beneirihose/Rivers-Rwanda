import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Wifi, Car, TreePine, Paintbrush, ArrowUpCircle, Sofa, X, Image as ImageIcon, Dumbbell, Utensils, Bath, Tv, Waves, Volume2 } from 'lucide-react';

const rwandaDistricts = [
  "Gasabo", "Kicukiro", "Nyarugenge", // Kigali
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo", // North
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango", // South
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana", // East
  "Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro" // West
].sort();

const schema = z.object({
  type: z.enum(['apartment', 'hotel_room', 'event_hall']),
  sub_type: z.enum(['whole', 'room']).optional(),
  purpose: z.enum(['rent', 'sale', 'both']).default('rent'),
  name: z.string().min(5, 'Name must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  city: z.string().min(1, 'District is required'),
  district: z.string().min(1, 'Sector/Neighborhood is required'),
  price_per_night: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  price_per_event: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  sale_price: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  floor_number: z.preprocess(val => val ? Number(val) : undefined, z.number().optional()),
  room_name_number: z.string().optional(),
  bed_type: z.enum(['single', 'double', 'triple', 'other']).optional(),
  number_of_living_rooms: z.preprocess(val => val ? Number(val) : undefined, z.number().positive().optional()),
  wifi: z.boolean().optional(),
  parking: z.boolean().optional(),
  garden: z.boolean().optional(),
  decoration: z.boolean().optional(),
  sonolization: z.boolean().optional(),
  gym: z.boolean().optional(),
  kitchen: z.boolean().optional(),
  toilet: z.boolean().optional(),
  living_room: z.boolean().optional(),
  swimming_pool: z.boolean().optional(),
  has_elevator: z.boolean().optional(),
  is_furnished: z.boolean().optional(),
  images: z.any().refine(files => files?.length > 0, 'At least one image is required.'),
  agreed_to_commission: z.boolean().refine(val => val === true, "You must agree to the commission terms."),
}).refine(data => {
    if (data.type === 'event_hall') return !!data.price_per_event;
    if (data.type === 'apartment' && data.purpose === 'sale') return !!data.sale_price;
    return !!data.price_per_night;
}, {
    message: 'Price is required for the selected accommodation type and purpose',
    path: ['price_per_night'],
});

const AddAccommodationForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.infer<typeof schema>>({ 
    resolver: zodResolver(schema), 
    defaultValues: { 
        type: 'apartment',
        sub_type: 'whole',
        purpose: 'rent',
        city: 'Nyarugenge',
        wifi: false,
        parking: false,
        garden: false,
        decoration: false,
        sonolization: false,
        gym: false,
        kitchen: false,
        toilet: false,
        living_room: false,
        swimming_pool: false,
        has_elevator: false,
        is_furnished: false,
        images: null as any
    } 
  });
  
  const type = watch('type');
  const sub_type = watch('sub_type');
  const purpose = watch('purpose');
  const selectedImages = watch('images');

  useEffect(() => {
    if (selectedImages && selectedImages.length > 0) {
      const previews = Array.from(selectedImages as FileList).map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
      return () => previews.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [selectedImages]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'images' && data.images) {
        for (let i = 0; i < data.images.length; i++) {
          formData.append('images', data.images[i]);
        }
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      await api.post('/accommodations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Accommodation created successfully! Pending approval.');
      navigate('/seller/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-white p-8 md:p-14 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <div className="space-y-2">
            <h2 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">List New Accommodation</h2>
            <p className="text-gray-500 font-medium">Provide detailed information about your property.</p>
        </div>

        {/* Accommodation Type & Purpose */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property Category</label>
                <select {...register('type')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50">
                    <option value="apartment">Apartment</option>
                    <option value="hotel_room">Hotel Room</option>
                    <option value="event_hall">Event Hall</option>
                </select>
            </div>

            {type === 'apartment' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Apartment Type</label>
                    <select {...register('sub_type')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50">
                        <option value="whole">Whole Apartment</option>
                        <option value="room">Room for Room</option>
                    </select>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {type === 'apartment' && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Listing Purpose</label>
                    <select {...register('purpose')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50">
                        <option value="rent">For Rent</option>
                        <option value="sale">For Sale</option>
                        <option value="both">Both (Rent & Sale)</option>
                    </select>
                </div>
            )}
            
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name / Title</label>
                <input {...register('name')} placeholder="e.g. Luxury Penthouse" className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50" />
                {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.name.message as string}</p>}
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detailed Description</label>
            <textarea {...register('description')} rows={4} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50"></textarea>
            {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase mt-1">{errors.description.message as string}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">District (City)</label>
                <select {...register('city')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50">
                    {rwandaDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sector / Neighborhood</label>
                <input {...register('district')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50" />
            </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
            {type === 'event_hall' ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Per Event (Rwf)</label>
                    <input type="number" {...register('price_per_event')} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none shadow-sm" />
                </div>
            ) : type === 'hotel_room' ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Per Night (Rwf)</label>
                    <input type="number" {...register('price_per_night')} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none shadow-sm" />
                </div>
            ) : (
                <>
                    {(purpose === 'rent' || purpose === 'both') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price Per Night (Rwf)</label>
                            <input type="number" {...register('price_per_night')} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none shadow-sm" />
                        </div>
                    )}
                    {(purpose === 'sale' || purpose === 'both') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sale Price (Rwf)</label>
                            <input type="number" {...register('sale_price')} className="w-full p-4 border-2 border-white rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none shadow-sm" />
                        </div>
                    )}
                </>
            )}
        </div>

        {/* Type Specific Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(type === 'hotel_room' || type === 'apartment') && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Floor Number</label>
                    <input type="number" {...register('floor_number')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50" />
                </div>
            )}
            {(sub_type === 'room' || type === 'hotel_room') && (
                <>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Room Name / Number</label>
                        <input {...register('room_name_number')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bed Type</label>
                        <select {...register('bed_type')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50">
                            <option value="single">Single Bed</option>
                            <option value="double">Double Bed</option>
                            <option value="triple">Triple Bed</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </>
            )}
            {type === 'apartment' && (
                <>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" {...register('has_elevator')} className="hidden" />
                            <div className={`p-3 rounded-xl border-2 transition-all ${watch('has_elevator') ? 'bg-accent-orange border-accent-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                <ArrowUpCircle size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark">Has Elevator</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" {...register('is_furnished')} className="hidden" />
                            <div className={`p-3 rounded-xl border-2 transition-all ${watch('is_furnished') ? 'bg-accent-orange border-accent-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                <Sofa size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-dark">Fully Furnished</span>
                        </label>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Number of Living Rooms</label>
                        <input type="number" min={0} {...register('number_of_living_rooms')} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-bold text-primary-dark focus:border-accent-orange outline-none transition-all bg-gray-50" />
                    </div>
                </>
            )}
        </div>

        {/* Features & Previews */}
        <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Features & Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(type === 'event_hall' ? [
                    { id: 'wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                    { id: 'parking', label: 'Parking', icon: <Car size={20}/> },
                    { id: 'garden', label: 'Garden', icon: <TreePine size={20}/> },
                    { id: 'decoration', label: 'Decoration', icon: <Paintbrush size={20}/> },
                    { id: 'sonolization', label: 'Sonolization', icon: <Volume2 size={20}/> },
                ] : type === 'hotel_room' ? [
                    { id: 'wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                    { id: 'parking', label: 'Parking', icon: <Car size={20}/> },
                    { id: 'garden', label: 'Garden', icon: <TreePine size={20}/> },
                    { id: 'gym', label: 'Gym', icon: <Dumbbell size={20}/> },
                    { id: 'kitchen', label: 'Kitchen', icon: <Utensils size={20}/> },
                    { id: 'toilet', label: 'Bathroom', icon: <Bath size={20}/> },
                    { id: 'living_room', label: 'Living Room', icon: <Tv size={20}/> },
                    { id: 'swimming_pool', label: 'Pool', icon: <Waves size={20}/> },
                ] : [
                    { id: 'wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                    { id: 'parking', label: 'Parking', icon: <Car size={20}/> },
                    { id: 'garden', label: 'Garden', icon: <TreePine size={20}/> },
                    { id: 'gym', label: 'Gym', icon: <Dumbbell size={20}/> },
                    { id: 'kitchen', label: 'Kitchen', icon: <Utensils size={20}/> },
                    { id: 'toilet', label: 'Bathroom', icon: <Bath size={20}/> },
                    { id: 'living_room', label: 'Living Room', icon: <Tv size={20}/> },
                    { id: 'swimming_pool', label: 'Pool', icon: <Waves size={20}/> },
                ]).map(feat => (
                    <label key={feat.id} className="cursor-pointer group">
                        <input type="checkbox" {...register(feat.id as any)} className="hidden" />
                        <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${watch(feat.id as any) ? 'bg-accent-orange border-accent-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            {feat.icon}
                            <span className="text-[9px] font-black uppercase tracking-widest">{feat.label}</span>
                        </div>
                    </label>
                ))}
            </div>
        </div>

        {/* Images Upload & Gallery Preview */}
        <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Property Images (Max 6)</label>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => {
                            const dt = new DataTransfer();
                            const files = selectedImages as FileList;
                            for (let i = 0; i < files.length; i++) if (i !== idx) dt.items.add(files[i]);
                            setValue('images', dt.files);
                        }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                    </div>
                ))}
                {imagePreviews.length < 6 && (
                    <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-4 border-dashed border-gray-100 bg-gray-50 cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-gray-400 hover:text-accent-orange">
                        <input type="file" multiple accept="image/*" onChange={(e) => {
                            const dt = new DataTransfer();
                            if (selectedImages) for (let i = 0; i < selectedImages.length; i++) dt.items.add(selectedImages[i]);
                            if (e.target.files) {
                                for (let i = 0; i < e.target.files.length; i++) {
                                    if (dt.items.length < 6) dt.items.add(e.target.files[i]);
                                    else toast.error("Maximum 6 images allowed");
                                }
                            }
                            setValue('images', dt.files);
                        }} className="hidden" />
                        <ImageIcon size={32} />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-2">Add Image</span>
                    </label>
                )}
            </div>
            {errors.images && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{errors.images.message as string}</p>}
        </div>

        {/* Terms */}
        <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100 flex items-start gap-4">
            <input type="checkbox" {...register('agreed_to_commission')} id="commission" className="mt-1 h-5 w-5 text-accent-orange focus:ring-accent-orange border-gray-300 rounded cursor-pointer"/>
            <div className="space-y-1">
                <label htmlFor="commission" className="text-sm font-bold text-primary-dark uppercase tracking-tight cursor-pointer">Agree to Commission Terms</label>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">I agree to pay a 10% commission fee to Rivers Rwanda for every successful booking.</p>
                {errors.agreed_to_commission && <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.agreed_to_commission.message as string}</p>}
            </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary-dark text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all duration-500 shadow-2xl disabled:bg-gray-300">
            {loading ? 'Processing...' : 'Submit Listing for Approval'}
        </button>
        </form>
    </div>
  );
};

export default AddAccommodationForm;
