import { useEffect, useState } from 'react';
import api from '../../services/api';

interface InvoiceProps {
  bookingId: string;
  onClose: () => void;
}

const Invoice = ({ bookingId, onClose }: InvoiceProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}/invoice`);
        setInvoice(response.data.data);
      } catch (error) {
        console.error('Failed to fetch invoice data', error);
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) {
      fetchInvoiceData();
    }
  }, [bookingId]);

  if (loading) return <div>Loading Invoice...</div>;
  if (!invoice) return <div>Could not load invoice data.</div>;

  const { 
    client_first_name, client_last_name, client_email, client_phone, 
    booking_reference, created_at, booking_type, total_amount, 
    payment_method, house_title, vehicle_make, accommodation_name,
    qrCodeImage 
  } = invoice;

  let bookedItem = house_title || `${vehicle_make}` || accommodation_name || 'N/A';

  return (
    <div id="invoice-content" className="bg-white p-10 rounded-lg shadow-lg max-w-3xl mx-auto my-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">INVOICE</h1>
          <p className="text-gray-500">Ref: {booking_reference}</p>
        </div>
        <div className="text-right">
            <p className="font-bold text-primary-dark">Rivers Rwanda</p>
            <p>Kigali, Rwanda</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <h3 className="font-bold text-gray-500 uppercase text-sm mb-2">Bill To</h3>
          <p className="font-bold text-lg">{`${client_first_name} ${client_last_name}`}</p>
          <p>{client_email}</p>
          <p>{client_phone}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">Invoice Date:</span> {new Date(created_at).toLocaleDateString()}</p>
          <p><span className="font-bold">Payment Method:</span> <span className="capitalize">{payment_method.replace('_', ' ')}</span></p>
        </div>
      </div>

      <table className="w-full mb-10">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-3 font-bold text-gray-600">Description</th>
            <th className="text-right p-3 font-bold text-gray-600">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="p-3">
                <p className="font-bold capitalize">{booking_type.replace('_', ' ')}: {bookedItem}</p>
            </td>
            <td className="text-right p-3">Rwf {Number(total_amount).toLocaleString()}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="text-right p-3 font-bold text-xl">Total</td>
            <td className="text-right p-3 font-bold text-xl">Rwf {Number(total_amount).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">Thank you for your business!</p>
        <img src={qrCodeImage} alt="Booking QR Code" className="w-24 h-24" />
      </div>
    </div>
  );
};

export default Invoice;
