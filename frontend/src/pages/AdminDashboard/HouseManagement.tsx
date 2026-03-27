import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Plus, Edit2, Trash2, X, Image as ImageIcon, XCircle, MapPin, BedDouble, Bath, Layout, Construction, Zap, Droplets, Wifi, Car, TreePine, Grid3X3, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SERVER_BASE_URL = API_BASE_URL.split('/api/v1')[0];

const HouseManagement = () => {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '', description: '', purpose: 'rent', province: '', district: '', sector: '', full_address: '',
    size_sqm: '', total_rooms: '', bedrooms: '', bathrooms: '', balconies: '',
    kitchen_type: 'inside', toilet_type: 'inside', material_used: 'block_sima', ceiling_type: 'plafond',
    has_tiles: false, has_electricity: true, has_water: true, has_parking: false, has_garden: false, has_wifi: false,
    monthly_rent_price: '', purchase_price: '', status: 'available'
  });

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/houses?status=all');
      setHouses(response.data.data);
    } catch (error) {
      toast.error('Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(); }, []);

  const resetForm = () => {
    setFormData({
      title: '', description: '', purpose: 'rent', province: '', district: '', sector: '', full_address: '',
      size_sqm: '', total_rooms: '', bedrooms: '', bathrooms: '', balconies: '',
      kitchen_type: 'inside', toilet_type: 'inside', material_used: 'block_sima', ceiling_type: 'plafond',
      has_tiles: false, has_electricity: true, has_water: true, has_parking: false, has_garden: false, has_wifi: false,
      monthly_rent_price: '', purchase_price: '', status: 'available'
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

  const handleEdit = (h: any) => {
    resetForm();
    setCurrentId(h.id);
    setFormData({
      title: h.title, description: h.description, purpose: h.purpose || 'rent',
      province: h.province, district: h.district, sector: h.sector, full_address: h.full_address || '',
      size_sqm: h.size_sqm || '', total_rooms: h.total_rooms || '', bedrooms: h.bedrooms || '', bathrooms: h.bathrooms || '', balconies: h.balconies || '',
      kitchen_type: h.kitchen_type || 'inside', toilet_type: h.toilet_type || 'inside', material_used: h.material_used || 'block_sima', ceiling_type: h.ceiling_type || 'plafond',
      has_tiles: !!h.has_tiles, has_electricity: !!h.has_electricity, has_water: !!h.has_water, has_parking: !!h.has_parking, has_garden: !!h.has_garden, has_wifi: !!h.has_wifi,
      monthly_rent_price: h.monthly_rent_price || '', purchase_price: h.purchase_price || '', status: h.status
    });
    setExistingImages(parseImages(h.images));
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    
    Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
            data.append(key, String(val));
        }
    });

    selectedFiles.forEach(f => data.append('images', f));
    if (isEditing) data.append('existingImages', JSON.stringify(existingImages));

    try {
      if (isEditing) await api.patch(`/houses/${currentId}`, data);
      else await api.post('/houses', data);
      toast.success(isEditing ? 'House updated!' : 'House listed!');
      setShowForm(false);
      resetForm();
      fetchHouses();
    } catch (error) { toast.error('Operation failed.'); }
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Are you sure you want to delete this listing?')) {
        try {
            await api.delete(`/houses/${id}`);
            toast.success('Listing deleted');
            fetchHouses();
        } catch(e) { toast.error('Failed to delete'); }
    }
  }

  const parseImages = (imgData: any) => {
    try { const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div></div>;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">House Management</h1>
          <p className="text-text-light mt-1 font-medium">Add, update or remove premium houses from the listings.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if(showForm) resetForm(); }} className="bg-primary-dark text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-accent-orange transition-all shadow-xl uppercase text-xs tracking-widest">
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'CLOSE' : 'ADD NEW HOUSE'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Purpose</label><select className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})}><option value="rent">For Rent</option><option value="sale">For Sale</option><option value="both">Both</option></select></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Listing Status</label><select className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option value="available">Available</option><option value="rented">Rented</option><option value="purchased">Purchased</option><option value="under maintenance">Maintenance</option></select></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Title</label><input type="text" className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50 focus:border-accent-orange outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2"><MapPin size={18} className="text-accent-orange" /><h3 className="text-sm font-black uppercase text-primary-dark">Location Details</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input className="p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="Province" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} />
                        <input className="p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="District" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                        <input className="p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="Sector" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} />
                    </div>
                    <input className="w-full p-4 border-2 rounded-2xl font-bold bg-gray-50" placeholder="Full Detailed Address" value={formData.full_address} onChange={e => setFormData({...formData, full_address: e.target.value})} />
                </div>

                <div className="space-y-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                    <div className="flex items-center gap-2"><Construction size={18} className="text-accent-orange" /><h3 className="text-sm font-black uppercase text-primary-dark">Structural Specs</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">Size (SQM)</label><input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.size_sqm} onChange={e => setFormData({...formData, size_sqm: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">Kitchen</label><select className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.kitchen_type} onChange={e => setFormData({...formData, kitchen_type: e.target.value})}><option value="inside">Inside</option><option value="outside">Outside</option><option value="both">Both</option></select></div>
                        <div className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">Toilet</label><select className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.toilet_type} onChange={e => setFormData({...formData, toilet_type: e.target.value})}><option value="inside">Inside</option><option value="outside">Outside</option><option value="both">Both</option></select></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[ { label: 'Bedrooms', name: 'bedrooms', icon: <BedDouble size={20}/> }, { label: 'Bathrooms', name: 'bathrooms', icon: <Bath size={20}/> }, { label: 'Balconies', name: 'balconies', icon: <Layout size={20}/> }, { label: 'Total Rooms', name: 'total_rooms', icon: <Home size={20}/> }].map(room => (
                        <div key={room.name} className="space-y-2"><label className="text-[9px] font-black uppercase text-gray-400">{room.label}</label><div className="relative"><input type="number" className="w-full p-4 pl-12 border-2 border-gray-100 rounded-2xl font-bold" value={(formData as any)[room.name]} onChange={e => setFormData({...formData, [room.name]: e.target.value})} /><div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent-orange">{room.icon}</div></div></div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-orange-50/50 rounded-[2.5rem] border border-orange-100">
                    {(formData.purpose === 'rent' || formData.purpose === 'both') && <div className="space-y-2"><label className="text-[10px] font-black uppercase text-primary-dark">Monthly Rent (Rwf)</label><input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.monthly_rent_price} onChange={e => setFormData({...formData, monthly_rent_price: e.target.value})} /></div>}
                    {(formData.purpose === 'sale' || formData.purpose === 'both') && <div className="space-y-2"><label className="text-[10px] font-black uppercase text-primary-dark">Purchase Price (Rwf)</label><input type="number" className="w-full p-4 border-2 border-white rounded-2xl font-bold" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} /></div>}
                </div>

                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Features & Facilities</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[ { id: 'has_tiles', label: 'Tiles', icon: <Grid3X3 size={20}/> }, { id: 'has_electricity', label: 'Electricity', icon: <Zap size={20}/> }, { id: 'has_water', label: 'Water', icon: <Droplets size={20}/> }, { id: 'has_parking', label: 'Parking', icon: <Car size={20}/> }, { id: 'has_garden', label: 'Garden', icon: <TreePine size={20}/> }, { id: 'has_wifi', label: 'WiFi', icon: <Wifi size={20}/> }].map(feat => (
                            <label key={feat.id} className="cursor-pointer group"><input type="checkbox" className="hidden" checked={(formData as any)[feat.id]} onChange={e => setFormData({...formData, [feat.id]: e.target.checked})} /><div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${(formData as any)[feat.id] ? 'bg-accent-orange border-accent-orange text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>{feat.icon}<span className="text-[9px] font-black uppercase tracking-widest text-center">{feat.label}</span></div></label>
                        ))}
                    </div>
                </div>

                <div className="space-y-6"><label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Images (Max 6)</label><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{existingImages.map((img, i) => (<div key={`ex-${i}`} className="relative aspect-video rounded-2xl overflow-hidden border-2 shadow-sm"><img src={`${SERVER_BASE_URL}${img}`} className="w-full h-full object-cover" /><button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"><XCircle size={16}/></button></div>))}{imagePreviews.map((pre, i) => (<div key={`pre-${i}`} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-accent-orange group shadow-sm"><img src={pre} className="w-full h-full object-cover" /><button type="button" onClick={() => removeNewImage(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button></div>))}{imagePreviews.length + existingImages.length < 6 && (<label className="flex flex-col items-center justify-center aspect-video rounded-2xl border-4 border-dashed bg-gray-50 cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-gray-400 hover:text-accent-orange"><input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange}/><ImageIcon size={32} /><span className="text-[9px] font-black uppercase mt-2">Add Image</span></label>)}</div></div>

                <button type="submit" className="w-full bg-primary-dark text-white font-black py-6 rounded-[2rem] uppercase tracking-[0.2em] text-xs hover:bg-accent-orange transition-all duration-500 shadow-2xl active:scale-95">{isEditing ? 'UPDATE HOUSE RECORD' : 'SAVE NEW HOUSE'}</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Preview</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Property Info</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Purpose</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Price</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="p-6 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {houses.map((h) => {
                const images = parseImages(h.images);
                const imageUrl = images[0] ? `${SERVER_BASE_URL}${images[0]}` : 'https://via.placeholder.com/150x100?text=No+Image';
                const price = h.monthly_rent_price || h.purchase_price;
                return (
                  <tr key={h.id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="p-6">
                      <div className="w-20 h-14 rounded-xl overflow-hidden border shadow-sm">
                        <img src={imageUrl} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-primary-dark text-xs uppercase tracking-tight">{h.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{h.district}, {h.province}</p>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black uppercase ${h.purpose === 'sale' ? 'text-purple-500' : 'text-blue-500'}`}>
                        {h.purpose || 'RENT'}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-primary-dark text-xs whitespace-nowrap">
                      Rwf {Number(price).toLocaleString()}
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        h.status === 'available' ? 'bg-green-100 text-green-700' : 
                        h.status === 'rented' ? 'bg-blue-100 text-blue-700' :
                        h.status === 'purchased' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(h)} className="p-3 bg-gray-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(h.id)} className="p-3 bg-gray-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {houses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 italic text-sm">
                    No house listings found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HouseManagement;
