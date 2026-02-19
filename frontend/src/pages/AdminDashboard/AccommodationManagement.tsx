import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Home, Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, XCircle } from 'lucide-react';

const AccommodationManagement = () => {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  // State for handling multiple files and their previews
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    type: 'apartment',
    name: '',
    description: '',
    city: 'Kigali',
    district: '',
    price_per_night: '',
    price_per_event: '',
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

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const resetForm = () => {
    setFormData({
        type: 'apartment', name: '', description: '', city: 'Kigali', district: '',
        price_per_night: '', price_per_event: '', status: 'available'
      });
    setSelectedFiles([]);
    setExistingImages([]);
    setIsEditing(false);
    setCurrentId(null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + selectedFiles.length + existingImages.length > 6) {
        toast.error('You can upload a maximum of 6 images.');
        return;
      }
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const imagePreviews = useMemo(() => selectedFiles.map(file => URL.createObjectURL(file)), [selectedFiles]);

  const handleEdit = (item: any) => {
    resetForm();
    setCurrentId(item.id);
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description,
      city: item.city,
      district: item.district,
      price_per_night: item.price_per_night || '',
      price_per_event: item.price_per_event || '',
      status: item.status
    });
    setExistingImages(parseImages(item.images));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value as string);
    });
    
    // Append new files
    selectedFiles.forEach(file => {
      data.append('images', file);
    });

    // If editing, handle existing images
    if (isEditing) {
        data.append('images', JSON.stringify(existingImages));
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEditing && currentId) {
        await api.patch(`/accommodations/${currentId}`, data, config);
        toast.success('Updated successfully');
      } else {
        await api.post('/accommodations', data, config);
        toast.success('Added successfully');
      }
      
      setShowForm(false);
      resetForm();
      fetchAccommodations();

    } catch (error) {
      toast.error('Operation failed. Please check the details and try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/accommodations/${id}`);
        toast.success('Listing deleted successfully');
        fetchAccommodations();
      } catch (error) {
        toast.error('Failed to delete listing');
      }
    }
  };

  const parseImages = (imagesData: any) => {
    if (!imagesData) return [];
    try {
      return typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
    } catch (e) {
      return [];
    }
  };

  // Render helpers
  const renderImagePreviews = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
      {existingImages.map((img, i) => (
          <div key={`existing-${i}`} className="relative group aspect-square">
              <img src={`http://localhost:5000${img}`} className="w-full h-full object-cover rounded-lg border-2 border-gray-300"/>
              <button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20}/></button>
          </div>
      ))}
      {imagePreviews.map((preview, i) => (
          <div key={`new-${i}`} className="relative group aspect-square">
              <img src={preview} className="w-full h-full object-cover rounded-lg border-2 border-accent-orange"/>
              <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><XCircle size={20}/></button>
          </div>
      ))}
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Manage Accommodations</h1>
          <p className="text-text-light mt-1">Add, update or remove property listings.</p>
        </div>
        <button 
          onClick={() => { setShowForm(prev => !prev); if(showForm) resetForm(); }}
          className="bg-accent-orange text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg"
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'CLOSE FORM' : 'ADD NEW'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-primary-dark mb-6 border-b pb-4">
            {isEditing ? 'Edit Accommodation' : 'Add New Accommodation'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... Form fields remain the same ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                <select className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option value="apartment">Apartment</option><option value="hotel_room">Hotel Room</option><option value="event_hall">Event Hall</option></select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                <textarea rows={3} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">City</label><input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">District</label><input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} required /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Price Per Night (Rwf)</label><input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.price_per_night} onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Price Per Event (Rwf)</label><input type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-orange outline-none transition-all" value={formData.price_per_event} onChange={(e) => setFormData({...formData, price_per_event: e.target.value})} /></div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase block">Manage Images (up to 6 total)</label>
              {(imagePreviews.length > 0 || existingImages.length > 0) && renderImagePreviews()}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-accent-orange transition-all cursor-pointer relative group mt-4">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={selectedFiles.length + existingImages.length >= 6}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className={`p-3 bg-gray-50 text-gray-400 group-hover:text-accent-orange transition-colors rounded-full ${selectedFiles.length + existingImages.length >= 6 ? '!text-gray-300' : ''}`}>
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-text-light">
                    {selectedFiles.length + existingImages.length >= 6 ? 'Maximum 6 images reached' : 'Click or drag to add more'}
                  </p>
                  <p className="text-xs text-gray-400">{6 - (selectedFiles.length + existingImages.length)} slots remaining</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-primary-dark text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg">
                {isEditing ? 'UPDATE LISTING' : 'SAVE LISTING'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table remains the same */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-text-light uppercase text-[10px] font-bold tracking-widest"><tr><th className="px-6 py-4">Preview</th><th className="px-6 py-4">Details</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {accommodations.map((item) => {
                const images = parseImages(item.images);
                const imageUrl = images[0] ? `http://localhost:5000${images[0]}` : 'https://via.placeholder.com/100x60?text=No+Img';
                const price = item.price_per_night || item.price_per_event;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4"><div className="w-20 h-12 rounded-lg overflow-hidden border shadow-sm"><img src={imageUrl} alt="preview" className="w-full h-full object-cover" /></div></td>
                    <td className="px-6 py-4"><p className="font-bold text-primary-dark">{item.name}</p><p className="text-xs text-text-light">{item.city}, {item.district}</p></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{item.type.replace('_', ' ')}</span></td>
                    <td className="px-6 py-4 font-bold text-primary-dark whitespace-nowrap text-sm">Rwf {price?.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{item.status}</span></td>
                    <td className="px-6 py-4"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button><button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button></div></td>
                  </tr>
                );
              })}
              {accommodations.length === 0 && (<tr><td colSpan={6} className="px-6 py-10 text-center text-text-light italic">No listings found</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccommodationManagement;
