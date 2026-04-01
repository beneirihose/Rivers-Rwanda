import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Plus, Edit2, Trash2, X, Image as ImageIcon, XCircle, 
  MapPin, Wifi, Car, TreePine, Sparkles, Box, Calendar, 
  Dumbbell, Utensils, Bath, Tv, Waves, ArrowUpCircle, Sofa, Volume2, Paintbrush
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '  https://rivers-rwanda.onrender.com/api/v1';
const SERVER_BASE_URL = API_BASE_URL.split('/api/v1')[0];

const AccommodationManagement = () => {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    type: 'apartment',
    sub_type: 'whole',
    purpose: 'rent',
    name: '',
    description: '',
    city: 'Kigali',
    district: '',
    street_address: '',
    price_per_night: '',
    price_per_event: '',
    sale_price: '',
    floor_number: '',
    number_of_living_rooms: '',
    room_name_number: '',
    bed_type: 'single',
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
    status: 'available'
  });

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accommodations');
      setAccommodations(response.data.data);
    } catch (error) {
      toast.error('Failed to load accommodations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccommodations(); }, []);

  const resetForm = () => {
    setFormData({
        type: 'apartment', sub_type: 'whole', purpose: 'rent', name: '', description: '', city: 'Kigali', district: '', street_address: '',
        price_per_night: '', price_per_event: '', sale_price: '', floor_number: '', number_of_living_rooms: '',
        room_name_number: '', bed_type: 'single',
        wifi: false, parking: false, garden: false, decoration: false, sonolization: false, gym: false, kitchen: false, 
        toilet: false, living_room: false, swimming_pool: false, has_elevator: false, is_furnished: false,
        status: 'available'
      });
    setSelectedFiles([]);
    setExistingImages([]);
    setImagePreviews([]);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length + existingImages.length > 6) {
        toast.error('Max 6 images allowed.');
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => {
        URL.revokeObjectURL(prev[idx]);
        return prev.filter((_, i) => i !== idx);
    });
  };

  const handleEdit = (item: any) => {
    resetForm();
    setCurrentId(item.id);
    setFormData({
      type: item.type,
      sub_type: item.sub_type || 'whole',
      purpose: item.purpose || 'rent',
      name: item.name,
      description: item.description,
      city: item.city,
      district: item.district,
      street_address: item.street_address || '',
      price_per_night: item.price_per_night || '',
      price_per_event: item.price_per_event || '',
      sale_price: item.sale_price || '',
      floor_number: item.floor_number || '',
      number_of_living_rooms: item.number_of_living_rooms || '',
      room_name_number: item.room_name_number || '',
      bed_type: item.bed_type || 'single',
      wifi: !!item.wifi,
      parking: !!item.parking,
      garden: !!item.garden,
      decoration: !!item.decoration,
      sonolization: !!item.sonolization,
      gym: !!item.gym,
      kitchen: !!item.kitchen,
      toilet: !!item.toilet,
      living_room: !!item.living_room,
      swimming_pool: !!item.swimming_pool,
      has_elevator: !!item.has_elevator,
      is_furnished: !!item.is_furnished,
      status: item.status
    });
    setExistingImages(parseImages(item.images));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => data.append(key, String(val)));
    selectedFiles.forEach(f => data.append('images', f));
    if (isEditing) data.append('existingImages', JSON.stringify(existingImages));

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEditing && currentId) await api.patch(`/accommodations/${currentId}`, data, config);
      else await api.post('/accommodations', data, config);
      
      toast.success(isEditing ? 'Updated successfully' : 'Added successfully');
      setShowForm(false);
      resetForm();
      fetchAccommodations();
    } catch (error) { toast.error('Operation failed.'); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this listing?')) {
      try {
        await api.delete(`/accommodations/${id}`);
        toast.success('Deleted');
        fetchAccommodations();
      } catch (error) { toast.error('Failed'); }
    }
  };

  const parseImages = (imgData: any) => {
    try { const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div></div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Accommodation Management</h1>
          <p className="text-text-light mt-1 font-medium">Manage premium apartments, hotel rooms, and event halls.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if(showForm) resetForm(); }} className="bg-primary-dark text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-accent-orange transition-all shadow-xl uppercase text-xs tracking-widest">
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'CLOSE' : 'ADD NEW'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                        <select className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="apartment">Apartment</option>
                            <option value="hotel_room">Hotel Room</option>
                            <option value="event_hall">Event Hall</option>
                        </select>
                    </div>
                    {formData.type === 'apartment' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Apartment Sub-Type</label>
                            <select className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.sub_type} onChange={e => setFormData({...formData, sub_type: e.target.value})}>
                                <option value="whole">Whole Apartment</option>
                                <option value="room">Apartment Room </option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {formData.type === 'apartment' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Purpose</label>
                            <select className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}>
                                <option value="rent">For Rent</option>
                                <option value="sale">For Sale</option>
                                <option value="both">Both (Rent & Sale)</option>
                            </select>
                        </div>
                    )}
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Listing Name</label><input type="text" className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2"><MapPin size={18} className="text-accent-orange" /><h3 className="text-sm font-black uppercase text-primary-dark">Location Details</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input className="p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        <input className="p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="District" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                    </div>
                    <input className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="Street Address / Detailed Location" value={formData.street_address} onChange={e => setFormData({...formData, street_address: e.target.value})} />
                </div>

                {/* Floor / Room details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                    {formData.type !== 'event_hall' && (
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">Floor Number</label><input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.floor_number} onChange={e => setFormData({...formData, floor_number: e.target.value})} /></div>
                    )}
                    {formData.type === 'apartment' && (
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">Number of Living Rooms</label><input type="number" min={0} className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.number_of_living_rooms} onChange={e => setFormData({...formData, number_of_living_rooms: e.target.value})} /></div>
                    )}
                </div>

                {(formData.sub_type === 'room' || formData.type === 'hotel_room') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">Room Name / Number</label><input type="text" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.room_name_number} onChange={e => setFormData({...formData, room_name_number: e.target.value})} /></div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-400">Bed Type</label>
                            <select className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.bed_type} onChange={e => setFormData({...formData, bed_type: e.target.value})}>
                                <option value="single">Single Bed</option>
                                <option value="double">Double Bed</option>
                                <option value="triple">Triple Bed</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Pricing - type-specific */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100">
                    {formData.type === 'event_hall' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-primary-dark flex items-center gap-2"><Sparkles size={14}/> Price Per Event (Rwf)</label>
                            <input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.price_per_event} onChange={e => setFormData({...formData, price_per_event: e.target.value})} />
                        </div>
                    )}
                    {formData.type === 'hotel_room' && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-primary-dark flex items-center gap-2"><Calendar size={14}/> Price Per Night (Rwf)</label>
                            <input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} />
                        </div>
                    )}
                    {formData.type === 'apartment' && (formData.purpose === 'rent' || formData.purpose === 'both') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-primary-dark flex items-center gap-2"><Calendar size={14}/> Price Per Night (Rwf)</label>
                            <input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.price_per_night} onChange={e => setFormData({...formData, price_per_night: e.target.value})} />
                        </div>
                    )}
                    {formData.type === 'apartment' && (formData.purpose === 'sale' || formData.purpose === 'both') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-primary-dark flex items-center gap-2"><Box size={14}/> Sale Price (Rwf)</label>
                            <input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Features & Amenities</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {(formData.type === 'event_hall' ? [
                            { id: 'wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                            { id: 'parking', label: 'Parking', icon: <Car size={20}/> },
                            { id: 'garden', label: 'Garden', icon: <TreePine size={20}/> },
                            { id: 'decoration', label: 'Decoration', icon: <Paintbrush size={20}/> },
                            { id: 'sonolization', label: 'Sonolization', icon: <Volume2 size={20}/> },
                        ] : formData.type === 'hotel_room' ? [
                            { id: 'wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                            { id: 'parking', label: 'Parking', icon: <Car size={20}/> },
                            { id: 'garden', label: 'Garden', icon: <TreePine size={20}/> },
                            { id: 'gym', label: 'Gym', icon: <Dumbbell size={20}/> },
                            { id: 'kitchen', label: 'Kitchen', icon: <Utensils size={20}/> },
                            { id: 'toilet', label: 'Bathroom', icon: <Bath size={20}/> },
                            { id: 'living_room', label: 'Living Room', icon: <Tv size={20}/> },
                            { id: 'swimming_pool', label: 'Pool', icon: <Waves size={20}/> },
                            { id: 'has_elevator', label: 'Elevator', icon: <ArrowUpCircle size={20}/> },
                            { id: 'is_furnished', label: 'Furnished', icon: <Sofa size={20}/> },
                        ] : [
                            { id: 'wifi', label: 'WiFi', icon: <Wifi size={20}/> },
                            { id: 'parking', label: 'Parking', icon: <Car size={20}/> },
                            { id: 'garden', label: 'Garden', icon: <TreePine size={20}/> },
                            { id: 'gym', label: 'Gym', icon: <Dumbbell size={20}/> },
                            { id: 'kitchen', label: 'Kitchen', icon: <Utensils size={20}/> },
                            { id: 'toilet', label: 'Bathroom', icon: <Bath size={20}/> },
                            { id: 'living_room', label: 'Living Room', icon: <Tv size={20}/> },
                            { id: 'swimming_pool', label: 'Pool', icon: <Waves size={20}/> },
                            { id: 'has_elevator', label: 'Elevator', icon: <ArrowUpCircle size={20}/> },
                            { id: 'is_furnished', label: 'Furnished', icon: <Sofa size={20}/> },
                        ]).map(feat => (
                            <label key={feat.id} className="cursor-pointer group">
                                <input type="checkbox" className="hidden" checked={(formData as any)[feat.id]} onChange={e => setFormData({...formData, [feat.id]: e.target.checked})} />
                                <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${(formData as any)[feat.id] ? 'bg-accent-orange border-accent-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    {feat.icon}
                                    <span className="text-[9px] font-black uppercase tracking-widest text-center">{feat.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</label><textarea rows={4} className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required /></div>

                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Gallery (Max 6)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {existingImages.map((img, i) => (
                            <div key={`ex-${i}`} className="relative aspect-video rounded-2xl overflow-hidden border-2 shadow-sm">
                                <img src={`${SERVER_BASE_URL}${img}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"><XCircle size={16}/></button>
                            </div>
                        ))}
                        {imagePreviews.map((pre, i) => (
                            <div key={`pre-${i}`} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-accent-orange group shadow-sm">
                                <img src={pre} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                            </div>
                        ))}
                        {imagePreviews.length + existingImages.length < 6 && (
                            <label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-4 border-dashed bg-gray-50 cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-gray-400 hover:text-accent-orange">
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange}/>
                                <ImageIcon size={32} />
                                <span className="text-[9px] font-black uppercase mt-2">Add Image</span>
                            </label>
                        )}
                    </div>
                </div>

                <button type="submit" className="w-full bg-primary-dark text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all duration-500 shadow-2xl active:scale-95">{isEditing ? 'UPDATE ACCOMMODATION' : 'SAVE LISTING'}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Preview</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Listing Info</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Type</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Pricing</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                    <th className="p-6 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {accommodations.map((item) => {
                const images = parseImages(item.images);
                const imageUrl = images[0] ? `${SERVER_BASE_URL}${images[0]}` : 'https://via.placeholder.com/150x100?text=No+Img';
                const price = item.price_per_night || item.price_per_event || item.sale_price;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="p-6"><div className="w-20 h-12 rounded-xl overflow-hidden border shadow-sm"><img src={imageUrl} className="w-full h-full object-cover" /></div></td>
                    <td className="p-6"><p className="font-bold text-primary-dark text-xs uppercase tracking-tight">{item.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase">{item.district}, {item.city}</p></td>
                    <td className="p-6">
                        <span className="text-[10px] font-black uppercase text-accent-orange block">{item.type.replace('_', ' ')}</span>
                        {item.sub_type && <span className="text-[8px] font-bold text-gray-400 uppercase">({item.sub_type})</span>}
                    </td>
                    <td className="p-6 font-bold text-primary-dark text-xs whitespace-nowrap">Rwf {Number(price).toLocaleString()}</td>
                    <td className="p-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></td>
                    <td className="p-6"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(item)} className="p-3 bg-gray-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><Edit2 size={16} /></button><button onClick={() => handleDelete(item.id)} className="p-3 bg-gray-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccommodationManagement;
