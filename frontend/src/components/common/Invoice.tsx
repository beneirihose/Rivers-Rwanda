import { useEffect, useState } from 'react';
import api from '../../services/api';
// @ts-ignore
import logo from '../../assets/images/logo.png';
import { X, Download } from 'lucide-react';

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

  const handlePrint = () => {
    const invoiceContent = document.getElementById('invoice-content');
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow && invoiceContent) {
      printWindow.document.write('<html><head><title>Print Invoice</title>');
      // Inject Tailwind CSS for printing
      printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">');
      printWindow.document.write('</head><body>');
      printWindow.document.write(invoiceContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => { // Ensure content is loaded before printing
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
  if (!invoice) return <div className="p-10 text-center text-red-500">Could not load invoice data.</div>;

  const { 
    client_first_name, client_last_name, client_email, client_phone, 
    booking_reference, created_at, booking_type, total_amount, 
    payment_method, house_title, vehicle_make, accommodation_name,
    qrCodeImage 
  } = invoice;

  let bookedItem = house_title || `${vehicle_make}` || accommodation_name || 'N/A';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div id="invoice-content" className="p-8 font-sans">
            <header className="flex justify-between items-center mb-8 pb-4 border-b">
                <img src={logo} alt="Rivers Rwanda Logo" className="h-16" />
                <div className="text-right">
                    <h1 className="text-3xl font-bold text-primary-dark">INVOICE</h1>
                    <p className="text-gray-500 text-sm">Ref: {booking_reference}</p>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
                    <p className="text-lg font-bold text-primary-dark">{`${client_first_name} ${client_last_name}`}</p>
                    <p className="text-gray-600 text-sm">{client_email}</p>
                    <p className="text-gray-600 text-sm">{client_phone}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Details</h3>
                    <p className="text-sm"><span className="font-semibold">Date:</span> {new Date(created_at).toLocaleDateString()}</p>
                    <p className="text-sm"><span className="font-semibold">Payment:</span> <span className="capitalize">{payment_method.replace('_', ' ')}</span></p>
                </div>
            </section>

            <section>
                <table className="w-full mb-8 border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="text-left p-3 font-bold text-xs text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="text-right p-3 font-bold text-xs text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b">
                            <td className="p-3">
                                <p className="font-bold capitalize text-primary-dark">{booking_type.replace('_', ' ')}</p>
                                <p className="text-gray-600 text-sm">{bookedItem}</p>
                            </td>
                            <td className="text-right p-3 font-mono">RWF {Number(total_amount).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            
            <section className="grid grid-cols-2 items-center gap-8 bg-gray-50 p-6 rounded-lg">
                <div className="text-left">
                    <h3 className="font-bold text-primary-dark text-sm mb-1">Scan for Interactive Details</h3>
                    <p className="text-gray-600 text-xs">Use any QR code scanner to view your live booking confirmation.</p>
                </div>
                <div className="flex justify-center">
                    <img src={qrCodeImage} alt="Booking QR Code" className="w-24 h-24 border-2 border-white rounded-md shadow-md" />
                </div>
            </section>

            <footer className="text-center text-gray-400 text-xs mt-8">
                <p>Thank you for choosing Rivers Rwanda!</p>
            </footer>
        </div>
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 flex justify-end gap-3 border-t">
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all">
                <X size={20} />
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-primary-dark text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                <Download size={16} />
                Download
            </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
