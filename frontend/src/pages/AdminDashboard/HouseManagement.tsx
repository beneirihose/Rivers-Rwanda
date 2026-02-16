import { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Home, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';

const HouseManagement = () => {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    size: '',
    total_rooms: '',
    bedrooms: '',
    bathrooms: '',
    has_parking: false,
    has_garden: false,
    has_wifi: false,
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    full_address: '',
    monthly_rent_price: '',
    purchase_price: '',
    status: 'available'
  });

  const fetchHouses = async () => {
    try {
      const response = await api.get('/houses');
      setHouses(response.data.data);
    } catch (error) {
      toast.error('Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedImages(e.target.files);
    }
  };

  const handleEdit = (h: any) => {
    setCurrentId(h.id);
    setFormData({
      title: h.title,
      description: h.description,
      size: h.size,
      total_rooms: h.total_rooms,
      bedrooms: h.bedrooms,
      bathrooms: h.bathrooms,
      has_parking: !!h.has_parking,
      has_garden: !!h.has_garden,
      has_wifi: !!h.has_wifi,
      province: h.province,
      district: h.district,
      sector: h.sector,
      cell: h.cell,
      village: h.village,
      full_address: h.full_address,
      monthly_rent_price: h.monthly_rent_price || '',
      purchase_price: h.purchase_price || '',
      status: h.status
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    // Sanitize data before sending
    const sanitizedData = {
      ...formData,
      total_rooms: formData.total_rooms || 0,
      bedrooms: formData.bedrooms || 0,
      bathrooms: formData.bathrooms || 0,
      monthly_rent_price: formData.monthly_rent_price || 0,
      purchase_price: formData.purchase_price || 0,
    };

    Object.keys(sanitizedData).forEach(key => {
      data.append(key, (sanitizedData as any)[key]);
    });

    if (selectedImages) {
      for (let i = 0; i < selectedImages.length; i++) {
        data.append('images', selectedImages[i]);
      }
    }

    try {
      if (isEditing && currentId) {
        await api.patch(`/houses/${currentId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('House updated');
      } else {
        await api.post('/houses', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('House added');
      }
      
      setShowForm(false);
      setIsEditing(false);
      setCurrentId(null);
      setSelectedImages(null);
      fetchHouses();
      setFormData({
        title: '', description: '', size: '', total_rooms: '', bedrooms: '', bathrooms: '',
        has_parking: false, has_garden: false, has_wifi: false, province: '', district: '',
        sector: '', cell: '', village: '', full_address: '', monthly_rent_price: '',
        purchase_price: '', status: 'available'
      });
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this house?')) {
      try {
        await api.delete(`/houses/${id}`);
        toast.success('Deleted');
        fetchHouses();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Manage Houses</h1>
          <p className="text-text-light mt-1">Add, update or remove houses from the listings.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setIsEditing(false); }}
          className="bg-accent-orange text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'CLOSE FORM' : 'ADD HOUSE'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-primary-dark mb-6 border-b pb-4">
            {isEditing ? 'Edit House' : 'Add New House'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Size (sqm)</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Total Rooms</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.total_rooms} onChange={(e) => setFormData({...formData, total_rooms: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Bedrooms</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.bedrooms} onChange={(e) => setFormData({...formData, bedrooms: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Bathrooms</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded text-accent-orange focus:ring-accent-orange" checked={formData.has_parking} onChange={(e) => setFormData({...formData, has_parking: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">Parking Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded text-accent-orange focus:ring-accent-orange" checked={formData.has_garden} onChange={(e) => setFormData({...formData, has_garden: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">Garden</span>
                </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded text-accent-orange focus:ring-accent-orange" checked={formData.has_wifi} onChange={(e) => setFormData({...formData, has_wifi: e.target.checked})} />
                    <span className="text-sm font-medium text-gray-700">Wi-fi</span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Province</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">District</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Sector</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Address</label>
              <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.full_address} onChange={(e) => setFormData({...formData, full_address: e.target.value})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Monthly Rent (Rwf)</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.monthly_rent_price} onChange={(e) => setFormData({...formData, monthly_rent_price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Purchase Price (Rwf)</label>
                <input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.purchase_price} onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="purchased">Purchased</option>
                  <option value="under maintenance">Under Maintenance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase block">Upload Images</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-accent-orange transition-all cursor-pointer relative group">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-4 bg-gray-50 text-gray-400 group-hover:text-accent-orange transition-colors rounded-full">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-text-light">{selectedImages ? `${selectedImages.length} files selected` : 'Click to upload house images'}</p>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary-dark text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg">
              {isEditing ? 'UPDATE HOUSE' : 'SAVE HOUSE'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-text-light uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Preview</th>
                <th className="px-6 py-4">House</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {houses.map((h) => {
                const placeholder = 'https://via.placeholder.com/150x100?text=No+Image';
                let imageUrl = placeholder;
                
                if (h.images) {
                  try {
                    const parsed = JSON.parse(h.images);
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
                      imageUrl = `http://localhost:5000${parsed[0]}`;
                    }
                  } catch (e) { /* Do nothing, use placeholder */ }
                }

                const price = h.monthly_rent_price || h.purchase_price;

                return (
                  <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-20 h-12 rounded-lg overflow-hidden border shadow-sm">
                        <img src={imageUrl} alt={h.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-primary-dark">{h.title}</p>
                      <p className="text-xs text-text-light">{h.bedrooms} beds, {h.bathrooms} baths</p>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-xs">{h.district}, {h.province}</td>
                    <td className="px-6 py-4 font-bold text-primary-dark whitespace-nowrap text-sm">
                      {price ? `Rwf ${Number(price).toLocaleString()}` : 'N/A'} {h.monthly_rent_price && '/ month'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        h.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(h)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(h.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
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

export default HouseManagement;
