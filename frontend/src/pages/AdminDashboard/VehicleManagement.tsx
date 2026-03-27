import { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Upload, XCircle } from 'lucide-react';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    purpose: 'rent',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    vehicle_type: 'sedan',
    transmission: 'automatic',
    fuel_type: 'petrol',
    seating_capacity: '5',
    daily_rate: '',
    sale_price: '',
    status: 'available'
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles');
      setVehicles(response.data.data);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const resetForm = () => {
    setFormData({
        purpose: 'rent', make: '', model: '', year: new Date().getFullYear().toString(),
        vehicle_type: 'sedan', transmission: 'automatic', fuel_type: 'petrol',
        seating_capacity: '5', daily_rate: '', sale_price: '', status: 'available'
      });
    setSelectedFiles([]);
    setExistingImages([]);
    setIsEditing(false);
    setCurrentId(null);
  };

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

  const handleEdit = (v: any) => {
    resetForm();
    setCurrentId(v.id);
    setFormData({
      purpose: v.purpose, make: v.make, model: v.model, year: v.year.toString(),
      vehicle_type: v.vehicle_type, transmission: v.transmission, fuel_type: v.fuel_type,
      seating_capacity: v.seating_capacity.toString(), daily_rate: v.daily_rate || '', 
      sale_price: v.sale_price || '', status: v.status
    });
    setExistingImages(parseImages(v.images));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value as string);
    });
    selectedFiles.forEach(file => data.append('images', file));
    if (isEditing) data.append('images', JSON.stringify(existingImages));

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (isEditing && currentId) {
        await api.patch(`/vehicles/${currentId}`, data, config);
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', data, config);
        toast.success('Vehicle added');
      }
      setShowForm(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error('Operation failed. Please check the details.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        toast.success('Vehicle deleted');
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const parseImages = (imagesData: any) => {
    try {
      const parsed = typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData;
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };
  
  const renderImagePreviews = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
      {existingImages.map((img, i) => (
          <div key={`existing-${i}`} className="relative group aspect-square"><img src={`http://localhost:5000${img}`} className="w-full h-full object-cover rounded-lg border-2" alt="" /><button type="button" onClick={() => removeExistingImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><XCircle size={20}/></button></div>
      ))}
      {imagePreviews.map((preview, i) => (
          <div key={`new-${i}`} className="relative group aspect-square"><img src={preview} className="w-full h-full object-cover rounded-lg border-2 border-accent-orange" alt="" /><button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><XCircle size={20}/></button></div>
      ))}
    </div>
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div></div>;

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <div><h1 className="text-3xl font-bold text-primary-dark">Manage Vehicles</h1><p className="text-text-light mt-1">Add, update or remove vehicles from inventory.</p></div>
            <button onClick={() => { setShowForm(prev => !prev); if(showForm) resetForm(); }} className="bg-accent-orange text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-opacity-90 shadow-lg"><Plus size={20} />ADD VEHICLE</button>
        </div>

        {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-xl font-bold text-primary-dark mb-6 border-b pb-4">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Purpose</label><select className="w-full p-3 border rounded-lg" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})}><option value="rent">Rent</option><option value="buy">Buy</option></select></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Make</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} required /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Model</label><input type="text" className="w-full p-3 border rounded-lg" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Year</label><input type="number" className="w-full p-3 border rounded-lg" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} required /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Type</label><select className="w-full p-3 border rounded-lg" value={formData.vehicle_type} onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}><option value="sedan">Sedan</option><option value="suv">SUV</option><option value="van">Van</option><option value="luxury">Luxury</option></select></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Transmission</label><select className="w-full p-3 border rounded-lg" value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})}><option value="automatic">Automatic</option><option value="manual">Manual</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Daily Rate (Rwf)</label><input type="number" className="w-full p-3 border rounded-lg" value={formData.daily_rate} onChange={(e) => setFormData({...formData, daily_rate: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Sale Price (Rwf)</label><input type="number" className="w-full p-3 border rounded-lg" value={formData.sale_price} onChange={(e) => setFormData({...formData, sale_price: e.target.value})} /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Status</label><select className="w-full p-3 border rounded-lg" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="available">Available</option><option value="rented">Rented</option><option value="sold">Sold</option></select></div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase block">Manage Images (up to 6 total)</label>
                      {(imagePreviews.length > 0 || existingImages.length > 0) && renderImagePreviews()}
                      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-accent-orange cursor-pointer relative group mt-4"><input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={selectedFiles.length + existingImages.length >= 6}/><div className="flex flex-col items-center gap-2"><div className={`p-3 bg-gray-50 text-gray-400 group-hover:text-accent-orange rounded-full ${selectedFiles.length + existingImages.length >= 6 ? '!text-gray-300' : ''}`}><Upload size={24} /></div><p className="text-sm font-medium text-text-light">{selectedFiles.length + existingImages.length >= 6 ? 'Maximum 6 images reached' : 'Click or drag to add more'}</p><p className="text-xs text-gray-400">{6 - (selectedFiles.length + existingImages.length)} slots remaining</p></div></div>
                    </div>
                    <button type="submit" className="w-full bg-primary-dark text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-opacity-90 shadow-lg">{isEditing ? 'UPDATE VEHICLE' : 'SAVE VEHICLE'}</button>
                </form>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
             <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-gray-50 text-text-light uppercase text-[10px] font-bold tracking-widest"><tr><th className="px-6 py-4">Preview</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Purpose</th><th className="px-6 py-4">Price/Rate</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{vehicles.map((v) => { const images = parseImages(v.images); const imageUrl = images[0] ? `http://localhost:5000${images[0]}` : 'https://via.placeholder.com/100x60?text=No+Img'; const price = v.purpose === 'rent' ? v.daily_rate : v.sale_price; return (<tr key={v.id} className="hover:bg-gray-50/50"><td className="px-6 py-4"><div className="w-20 h-12 rounded-lg overflow-hidden border shadow-sm"><img src={imageUrl} alt="preview" className="w-full h-full object-cover" /></div></td><td className="px-6 py-4"><p className="font-bold text-primary-dark">{v.make} {v.model}</p><p className="text-xs text-text-light">{v.year} | {v.transmission}</p></td><td className="px-6 py-4 capitalize font-medium text-xs">{v.purpose}</td><td className="px-6 py-4 font-bold text-primary-dark whitespace-nowrap text-sm">Rwf {price?.toLocaleString()} {v.purpose === 'rent' && '/ day'}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${v.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{v.status}</span></td><td className="px-6 py-4"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(v)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button><button onClick={() => handleDelete(v.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></div></td></tr>);})}</tbody></table></div>
        </div>
    </div>
  );
};

export default VehicleManagement;
