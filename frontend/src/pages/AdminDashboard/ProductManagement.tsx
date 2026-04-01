import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, XCircle, Trash2, User, Mail, Phone, 
  Home, Car, Building2, ShieldCheck, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || '  https://rivers-rwanda.onrender.com/api/v1';
const SERVER_BASE_URL = API_BASE_URL.split('/api/v1')[0];

const ProductManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/products/pending');
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleApproval = async (productType: string, productId: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/admin/products/${productType}/${productId}/${action}`);
      toast.success(`Product ${action}d successfully!`);
      fetchProducts();
    } catch (error) {
      toast.error(`Failed to ${action} product`);
    }
  };

  const handleDelete = async (productType: string, productId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this property?')) {
        try {
            const response = await api.delete(`/admin/products/${productType}/${productId}`);
            toast.success(response.data.message || 'Product deleted successfully');
            fetchProducts();
        } catch (error: any) {
            // Display the specific reason from the backend
            const errorMsg = error.response?.data?.message || 'Failed to delete product';
            toast.error(errorMsg, {
                duration: 5000,
                style: {
                    border: '1px solid #ef4444',
                    padding: '16px',
                    color: '#ef4444',
                    fontWeight: 'bold'
                },
                iconTheme: {
                    primary: '#ef4444',
                    secondary: '#FFFAEE',
                },
            });
        }
    }
  };

  const parseImages = (imgData: any) => {
    try {
        const parsed = typeof imgData === 'string' ? JSON.parse(imgData) : imgData;
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Product Control</h1>
          <p className="text-text-light mt-1 font-medium text-sm">Review and manage properties uploaded by system sellers.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Clock className="text-accent-orange" size={20} />
          <span className="text-sm font-black text-primary-dark uppercase tracking-widest">{products.length} Items Total</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-text-light uppercase text-[10px] font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="px-8 py-6">Property / Preview</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Seller Details</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {products.map((product, i) => {
                const images = parseImages(product.images);
                const imageUrl = images[0] ? `${SERVER_BASE_URL}${images[0]}` : 'https://via.placeholder.com/150x100?text=No+Image';
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={`${product.type}-${product.id}`} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-14 rounded-xl overflow-hidden border shadow-sm flex-shrink-0">
                          <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-primary-dark uppercase tracking-tight line-clamp-1">{product.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                            {product.type === 'house' ? <Home size={14} className="text-blue-500"/> : product.type === 'vehicle' ? <Car size={14} className="text-purple-500"/> : <Building2 size={14} className="text-orange-500"/>}
                            <span className="text-[10px] font-black text-primary-dark uppercase tracking-widest">{product.type}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-black text-primary-dark uppercase">
                            <User size={12} className="text-accent-orange" />
                            {product.first_name} {product.last_name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                            <Mail size={10} /> {product.email}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                            <Phone size={10} /> {product.phone_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                            product.status === 'available' ? 'bg-green-50 text-green-600 border-green-100' : 
                            ['rented', 'sold', 'purchased', 'unavailable'].includes(product.status) ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-yellow-50 text-yellow-600 border-yellow-100'
                        }`}>
                          {product.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-2">
                        {product.status === 'pending_approval' ? (
                            <>
                                <button onClick={() => handleApproval(product.type, product.id, 'approve')} className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm" title="Approve"><CheckCircle size={16} /></button>
                                <button onClick={() => handleApproval(product.type, product.id, 'reject')} className="p-3 bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white rounded-xl transition-all shadow-sm" title="Reject"><XCircle size={16} /></button>
                            </>
                        ) : (
                            <button className="p-3 bg-blue-50 text-blue-600 rounded-xl cursor-default opacity-50"><ShieldCheck size={16} /></button>
                        )}
                        <button onClick={() => handleDelete(product.type, product.id)} className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic text-sm">No seller products found in the system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
