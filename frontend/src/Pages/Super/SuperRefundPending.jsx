import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import {
  RefreshCw,
  Search,
  CheckCircle,
  FileText,
  User,
  Hotel
} from 'lucide-react';
import { motion } from 'framer-motion';

function SuperRefundPending() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const getAuthHeaders = () => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchBookings = async (tab) => {
    try {
      setLoading(true);
      const endpoint = tab === 'pending'
        ? `${import.meta.env.VITE_API_URL}/api/booking/admin/refund-pending`
        : `${import.meta.env.VITE_API_URL}/api/booking/admin/refund-completed`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(data.data || []);
      } else {
        Swal.fire('Error', data.message || 'Failed to fetch bookings', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred while fetching bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(activeTab);
  }, [activeTab]);

  const handleMarkAsRefunded = async (bookingId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You are marking this booking as fully refunded.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, mark as refunded!'
      });

      if (result.isConfirmed) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/booking/admin/refund`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ bookingId })
        });

        const data = await response.json();
        if (response.ok) {
          Swal.fire('Success!', 'Booking has been marked as refunded.', 'success');
          // Remove it from the UI list
          setBookings(prev => prev.filter(b => b._id !== bookingId));
        } else {
          Swal.fire('Error', data.message || 'Failed to update booking status', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'An error occurred while updating the status', 'error');
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.hotel?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <RefreshCw className="text-blue-500" size={32} />
            Refund Management
          </h1>
          <p className="text-slate-500 mt-2">Manage cancelled bookings and process refunds</p>
        </div>

        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending'
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Pending Refunds
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed'
                ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Completed Refunds
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by hotel, user or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {activeTab === 'pending' ? 'All Caught Up!' : 'No Refunds Yet'}
          </h3>
          <p className="text-slate-500">
            {activeTab === 'pending'
              ? 'There are no pending refunds at the moment.'
              : 'There are no completed refunds yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hotel</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={booking._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">{booking._id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{booking.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{booking.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          <Hotel size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{booking.hotel?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{booking.room?.room_type || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700">
                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {activeTab === 'pending' ? (
                        <button
                          onClick={() => handleMarkAsRefunded(booking._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/20"
                        >
                          <CheckCircle size={16} />
                          Mark Refunded
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100">
                          <CheckCircle size={14} />
                          Refunded
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperRefundPending;
