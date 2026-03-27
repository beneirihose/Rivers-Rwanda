import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { PlusCircle, Building2, Car, Home } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/sellers/products');
        setProducts(response.data.data);
      } catch (error) {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    navigate('/seller/products/new');
  };

  const getIcon = (type: string) => {
    if (type === 'house') return <Home size={18} className="text-blue-500" />;
    if (type === 'vehicle') return <Car size={18} className="text-purple-500" />;
    return <Building2 size={18} className="text-orange-500" />;
  };

  const statusColors: Record<string, string> = {
    pending_approval: 'bg-yellow-100 text-yellow-700',
    available: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    rented: 'bg-blue-100 text-blue-700',
    sold: 'bg-purple-100 text-purple-700',
    unavailable: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary-dark uppercase tracking-tighter">Product Management</h1>
            <p className="text-gray-500 font-medium">Manage and track your listed properties and vehicles.</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-accent-orange text-white font-black py-4 px-8 rounded-2xl flex items-center gap-3 hover:bg-primary-dark transition-all duration-500 shadow-xl shadow-accent-orange/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          <PlusCircle size={18} strokeWidth={3} />
          Add New Listing
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-orange border-t-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] shadow-xl border border-gray-100">
          <Building2 size={60} className="mx-auto text-gray-200 mb-6" />
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-8">You haven't added any products yet.</p>
          <button onClick={handleAddProduct} className="text-accent-orange font-black uppercase text-xs tracking-widest hover:underline">Start Listing Now</button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Info</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Purpose</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Listed Date</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-white transition-colors">
                                {getIcon(product.type)}
                            </div>
                            <span className="font-bold text-primary-dark uppercase text-xs tracking-tight">{product.name}</span>
                        </div>
                    </td>
                    <td className="p-6">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{product.type.replace('_', ' ')}</span>
                    </td>
                    <td className="p-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${product.purpose === 'sale' ? 'text-purple-500' : 'text-blue-500'}`}>
                            {product.purpose || 'RENT'}
                        </span>
                    </td>
                    <td className="p-6">
                        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full ${statusColors[product.status] || 'bg-gray-100 text-gray-700'}`}>
                        {product.status.replace('_', ' ')}
                        </span>
                    </td>
                    <td className="p-6 text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
