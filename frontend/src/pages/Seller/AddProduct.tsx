import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();

  const handleSelectProductType = (type: string) => {
    navigate(`/seller/products/new/${type}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add a New Product</h1>
      <div>
        <h2 className="text-xl font-semibold mb-4">Step 1: Choose a Product Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* House */}
          <div 
            onClick={() => handleSelectProductType('house')}
            className="p-8 border-2 rounded-2xl cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-center"
          >
            <h3 className="font-bold text-2xl text-primary-dark">House</h3>
            <p className="text-sm text-gray-600 mt-2">List a house for sale or for rent.</p>
          </div>
          {/* Accommodation */}
          <div 
            onClick={() => handleSelectProductType('accommodation')}
            className="p-8 border-2 rounded-2xl cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-center"
          >
            <h3 className="font-bold text-2xl text-primary-dark">Accommodation</h3>
            <p className="text-sm text-gray-600 mt-2">List an apartment, hotel room, or event hall.</p>
          </div>
          {/* Vehicle */}
          <div 
            onClick={() => handleSelectProductType('vehicle')}
            className="p-8 border-2 rounded-2xl cursor-pointer hover:border-accent-orange hover:bg-orange-50 transition-all text-center"
          >
            <h3 className="font-bold text-2xl text-primary-dark">Vehicle</h3>
            <p className="text-sm text-gray-600 mt-2">List a car for sale or for rent.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
