import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import {
  Users,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  FileText,
  MapPin,
  Eye,
  Check,
  X,
  Search,
  ShieldCheck,
  Bed,
  Hotel,
  AlertCircle,
  Phone,
  Ban,
  Trash2
} from 'lucide-react';

function SuperHotelAdmin({ defaultTab = 'approved' }) {
  const [approvedOwners, setApprovedOwners] = useState([]);
  const [unapprovedOwners, setUnapprovedOwners] = useState([]);
  const [approvedHotels, setApprovedHotels] = useState([]);
  const [pendingHotels, setPendingHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerHotels, setOwnerHotels] = useState([]);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentAction, setCurrentAction] = useState({ type: '', ownerId: null, ownerName: '' });
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  const getAuthHeaders = () => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Image URL Helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanedPath = imagePath.replace(/^public[\\/]/, '');
    return `${import.meta.env.VITE_API_URL}/${cleanedPath.replace(/\\/g, '/')}`;
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch all approved hotel owners
  const fetchApprovedOwners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/get-approved-hotel-owner`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setApprovedOwners(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch approved hotel owners.');
      }
    } catch (err) {
      setError('An error occurred while fetching approved hotel owners.');
    }
  };

  // Fetch all unapproved hotel owners
  const fetchUnapprovedOwners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/get-unapproved-hotel-owner`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setUnapprovedOwners(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch unapproved hotel owners.');
      }
    } catch (err) {
      setError('An error occurred while fetching unapproved hotel owners.');
    }
  };

  // Fetch all approved hotels
  const fetchApprovedHotels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/get-approved-hotels`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setApprovedHotels(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching approved hotels:', err);
    }
  };

  // Fetch all unapproved hotels
  const fetchPendingHotels = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/get-unapproved-hotels`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setPendingHotels(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching pending hotels:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchApprovedOwners(),
      fetchUnapprovedOwners(),
      fetchApprovedHotels(),
      fetchPendingHotels()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Fetch hotels for a specific owner
  const fetchOwnerHotels = async (owner) => {
    setSelectedOwner(owner);
    setLoadingHotels(true);
    setShowHotelsModal(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/get-owner-hotels`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ownerId: owner._id }),
      });
      const data = await response.json();
      if (response.ok) {
        setOwnerHotels(data.data || []);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to fetch owner hotels',
          confirmButtonColor: '#dc2626',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while fetching owner hotels',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoadingHotels(false);
    }
  };

  // Handle Owner Confirmation (Approve / Reject)
  const handleConfirmation = async (confirmed) => {
    setShowConfirmationModal(false);
    if (!confirmed) return;

    const { type, ownerId } = currentAction;
    setLoading(true);

    try {
      if (type === 'approve') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/approve-owner`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ hotelId: ownerId }),
        });
        const data = await response.json();
        if (response.ok) {
          await Promise.all([fetchApprovedOwners(), fetchUnapprovedOwners()]);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Owner approved successfully',
            confirmButtonColor: '#10b981',
          });
        } else {
          throw new Error(data.message || 'Failed to approve hotel owner');
        }
      } else if (type === 'reject') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/reject-owner`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({ hotelId: ownerId }),
        });
        const data = await response.json();
        if (response.ok) {
          await fetchUnapprovedOwners();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message || 'Owner rejected successfully',
            confirmButtonColor: '#10b981',
          });
        } else {
          throw new Error(data.message || 'Failed to reject hotel owner');
        }
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'An error occurred while processing your request',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger direct Approve Owner
  const triggerApproveOwner = async (ownerId, ownerName) => {
    const result = await Swal.fire({
      title: 'Approve Hotel Owner?',
      text: `Are you sure you want to approve "${ownerName}" as an official hotel owner?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve Owner',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/approve-owner`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ hotelId: ownerId }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowOwnerModal(false);
        await Promise.all([fetchApprovedOwners(), fetchUnapprovedOwners()]);
        Swal.fire({
          icon: 'success',
          title: 'Owner Approved!',
          text: `"${ownerName}" has been approved successfully.`,
          confirmButtonColor: '#10b981',
        });
      } else {
        throw new Error(data.message || 'Failed to approve hotel owner');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger direct Reject Owner
  const triggerRejectOwner = async (ownerId, ownerName) => {
    const result = await Swal.fire({
      title: 'Reject Hotel Owner?',
      text: `Are you sure you want to reject "${ownerName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Reject Owner',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/reject-owner`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ hotelId: ownerId }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowOwnerModal(false);
        await Promise.all([fetchApprovedOwners(), fetchUnapprovedOwners()]);
        Swal.fire({
          icon: 'success',
          title: 'Owner Rejected',
          text: `"${ownerName}" registration request has been rejected.`,
          confirmButtonColor: '#10b981',
        });
      } else {
        throw new Error(data.message || 'Failed to reject hotel owner');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Hotel Approval
  const handleApproveHotel = async (hotelId, hotelName) => {
    const result = await Swal.fire({
      title: 'Approve Hotel Property?',
      text: `Are you sure you want to approve "${hotelName}"? It will go live for user bookings.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Approve Hotel',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/approve-hotel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ hotel_id: hotelId }),
      });
      const data = await response.json();
      if (response.ok) {
        await Promise.all([fetchApprovedHotels(), fetchPendingHotels()]);
        Swal.fire({
          icon: 'success',
          title: 'Hotel Approved!',
          text: `"${hotelName}" is now active and published for bookings.`,
          confirmButtonColor: '#10b981',
        });
      } else {
        throw new Error(data.message || 'Failed to approve hotel');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Failed',
        text: err.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Hotel Rejection
  const handleRejectHotel = async (hotelId, hotelName) => {
    const result = await Swal.fire({
      title: 'Reject Hotel Property?',
      text: `Are you sure you want to reject and remove "${hotelName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Reject & Delete',
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/reject-hotel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ hotel_id: hotelId }),
      });
      const data = await response.json();
      if (response.ok) {
        await Promise.all([fetchApprovedHotels(), fetchPendingHotels()]);
        Swal.fire({
          icon: 'success',
          title: 'Hotel Removed',
          text: `"${hotelName}" has been rejected and removed.`,
          confirmButtonColor: '#10b981',
        });
      } else {
        throw new Error(data.message || 'Failed to reject hotel');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Rejection Failed',
        text: err.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Hotel Block / Unblock Toggle
  const handleToggleBlockHotel = async (hotelId, hotelName, currentStatus) => {
    const isCurrentlyBlocked = currentStatus === 'blocked';
    const actionText = isCurrentlyBlocked ? 'Unblock' : 'Block';
    const confirmColor = isCurrentlyBlocked ? '#10b981' : '#dc2626';

    const result = await Swal.fire({
      title: `${actionText} Hotel Property?`,
      text: isCurrentlyBlocked
        ? `Are you sure you want to unblock "${hotelName}"? It will restore normal status.`
        : `Are you sure you want to block "${hotelName}"? Room bookings will be disabled.`,
      icon: isCurrentlyBlocked ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Yes, ${actionText} Hotel`,
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/toggle-block-hotel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ hotel_id: hotelId, status: isCurrentlyBlocked ? 'available' : 'blocked' }),
      });
      const data = await response.json();
      if (response.ok) {
        await Promise.all([fetchApprovedHotels(), fetchPendingHotels()]);
        Swal.fire({
          icon: 'success',
          title: `Hotel ${isCurrentlyBlocked ? 'Unblocked' : 'Blocked'}!`,
          text: `"${hotelName}" status has been updated.`,
          confirmButtonColor: '#10b981',
        });
      } else {
        throw new Error(data.message || 'Failed to update hotel status');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: err.message,
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setLoading(false);
    }
  };

  const viewOwnerDetails = (owner) => {
    setSelectedOwner(owner);
    setShowOwnerModal(true);
  };

  const openConfirmationModal = (type, ownerId, ownerName = '') => {
    setCurrentAction({ type, ownerId, ownerName });
    setShowConfirmationModal(true);
  };

  // Filter lists by search query
  const filterList = (list) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.bussinessName && item.bussinessName.toLowerCase().includes(q)) ||
        (item.bussinessRegNo && item.bussinessRegNo.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q)) ||
        (item.address?.area && item.address.area.toLowerCase().includes(q)) ||
        (item.address?.district && item.address.district.toLowerCase().includes(q))
    );
  };

  const currentList = activeTab === 'approved' ? filterList(approvedOwners) : filterList(unapprovedOwners);
  const currentHotelList = activeTab === 'approved-hotels' ? filterList(approvedHotels) : filterList(pendingHotels);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 py-6 px-2">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {activeTab === 'approved' && (
                <>
                  <ShieldCheck className="text-emerald-500 w-8 h-8" />
                  Approved Hotel Owners
                </>
              )}
              {activeTab === 'unapproved' && (
                <>
                  <Clock className="text-amber-500 w-8 h-8" />
                  Pending Hotel Owners
                </>
              )}
              {activeTab === 'approved-hotels' && (
                <>
                  <Building2 className="text-emerald-500 w-8 h-8" />
                  Approved Hotel Properties
                </>
              )}
              {activeTab === 'pending-hotels' && (
                <>
                  <Clock className="text-amber-500 w-8 h-8" />
                  Pending Hotel Approvals
                </>
              )}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'approved' && 'Manage approved hotel partners and inspect their registered properties'}
              {activeTab === 'unapproved' && 'Review, verify, approve, or reject pending hotel owner applications'}
              {activeTab === 'approved-hotels' && 'Explore all published hotel properties live for public booking'}
              {activeTab === 'pending-hotels' && 'Review new hotel submissions from partners and approve or reject properties'}
            </p>
          </div>
        </div>

        {/* Metric Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Owners</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedOwners.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Owners</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{unapprovedOwners.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Hotels</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedHotels.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Hotels</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingHotels.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {activeTab === 'approved' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Approved Hotel Owners Directory
              </>
            )}
            {activeTab === 'unapproved' && (
              <>
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Hotel Owners Applications
              </>
            )}
            {activeTab === 'approved-hotels' && (
              <>
                <Building2 className="w-5 h-5 text-emerald-500" />
                Published & Active Hotels
              </>
            )}
            {activeTab === 'pending-hotels' && (
              <>
                <Clock className="w-5 h-5 text-amber-500" />
                Hotels Awaiting Super Admin Verification
              </>
            )}
          </h2>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, city, owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-red-500 mb-3"></div>
            <p className="text-slate-400 text-sm font-medium">Loading platform data...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center shadow-sm">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : activeTab === 'approved-hotels' || activeTab === 'pending-hotels' ? (
          /* HOTEL APPROVAL GRID */
          currentHotelList.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center border border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Hotel className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-700 mb-1">No Hotels Found</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                {searchQuery ? `No hotel properties matching "${searchQuery}"` : activeTab === 'approved-hotels' ? 'No approved hotels currently listed' : 'No new hotels currently pending approval'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentHotelList.map((hotel) => {
                const mainImage = hotel.hotelImages && hotel.hotelImages.length > 0 ? getImageUrl(hotel.hotelImages[0]) : getImageUrl(null);
                const owner = hotel.hotel_owner;
                return (
                  <div key={hotel._id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
                    {/* Hotel Cover Image */}
                    <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
                      <img
                        src={mainImage}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                        {hotel.status === 'blocked' ? (
                          <span className="bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Ban size={12} /> Blocked by Admin
                          </span>
                        ) : hotel.isApproved ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Clock size={12} /> Pending Approval
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
                        <Bed className="w-3.5 h-3.5 text-rose-400" />
                        {hotel.totalRooms || '0'} Rooms
                      </div>
                    </div>

                    {/* Hotel Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-1.5">{hotel.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mb-3">
                          <MapPin size={13} className="text-rose-500 shrink-0" />
                          <span>{[hotel.address?.area, hotel.address?.district, hotel.address?.pincode].filter(Boolean).join(', ')}</span>
                        </p>

                        {/* Owner Info Box */}
                        {owner && (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs space-y-1 my-2">
                            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span>{owner.bussinessName || 'Partner Property'}</span>
                            </div>
                            <div className="text-slate-500 flex items-center gap-1.5">
                              <Users size={12} className="text-slate-400 shrink-0" />
                              <span>Owner: {owner.user?.name || owner.name || 'N/A'}</span>
                            </div>
                            {(owner.user?.email || owner.email) && (
                              <div className="text-slate-500 flex items-center gap-1.5">
                                <Mail size={12} className="text-slate-400 shrink-0" />
                                <span>{owner.user?.email || owner.email}</span>
                              </div>
                            )}
                            {(owner.user?.contact || owner.contact || owner.phone) && (
                              <div className="text-slate-500 flex items-center gap-1.5">
                                <Phone size={12} className="text-slate-400 shrink-0" />
                                <span>{owner.user?.contact || owner.contact || owner.phone}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Amenities */}
                        {hotel.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                              <span key={idx} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                {amenity}
                              </span>
                            ))}
                            {hotel.amenities.length > 4 && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                +{hotel.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Approval & Block Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        {!hotel.isApproved ? (
                          <>
                            <button
                              onClick={() => handleApproveHotel(hotel._id, hotel.name)}
                              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Check size={15} /> Approve Hotel
                            </button>
                            <button
                              onClick={() => handleRejectHotel(hotel._id, hotel.name)}
                              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all border border-rose-200/60 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X size={15} /> Reject
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleBlockHotel(hotel._id, hotel.name, hotel.status)}
                              className={`flex-1 px-3 py-2 font-bold text-xs rounded-xl transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${hotel.status === 'blocked'
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                }`}
                            >
                              <Ban size={14} />
                              {hotel.status === 'blocked' ? 'Unblock Hotel' : 'Block Hotel'}
                            </button>
                            <button
                              onClick={() => handleRejectHotel(hotel._id, hotel.name)}
                              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition-all border border-slate-200/60 flex items-center justify-center gap-1.5 cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* OWNERS DIRECTORY TABLE */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {currentList.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <Building2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-700 mb-1">No owners found</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  {searchQuery ? `No results matching "${searchQuery}"` : activeTab === 'approved' ? 'No approved hotel owners yet' : 'No owners pending approval'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Business Details</th>
                      <th className="px-6 py-4">Owner Profile</th>
                      <th className="px-6 py-4">Contact & Email</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {currentList.map((owner) => (
                      <tr key={owner._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{owner.bussinessName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <FileText className="w-3 h-3 text-slate-400" />
                            Reg: {owner.bussinessRegNo}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                              {(owner.user?.name || owner.name)?.charAt(0) || 'O'}
                            </div>
                            {owner.user?.name || owner.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-slate-700 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {owner.user?.email || owner.email}
                          </div>
                          {(owner.user?.contact || owner.contact || owner.phone) && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {owner.user?.contact || owner.contact || owner.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {owner.isApproved ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/60 flex items-center w-fit gap-1">
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200/60 flex items-center w-fit gap-1">
                              <Clock size={12} /> Pending Verification
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(owner.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!owner.isApproved && (
                              <>
                                <button
                                  onClick={() => triggerApproveOwner(owner._id, owner.name)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  onClick={() => triggerRejectOwner(owner._id, owner.name)}
                                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all border border-rose-200/60 flex items-center gap-1 cursor-pointer"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => fetchOwnerHotels(owner)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                              title="View Registered Hotels"
                            >
                              <Hotel className="w-3.5 h-3.5 text-rose-500" /> Hotels
                            </button>
                            <button
                              onClick={() => viewOwnerDetails(owner)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registered Hotels Modal */}
      {showHotelsModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-rose-500" />
                  Registered Hotels
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hotels owned by <span className="text-white font-semibold">{selectedOwner?.name || 'Partner'}</span> ({selectedOwner?.bussinessName})
                </p>
              </div>
              <button
                onClick={() => setShowHotelsModal(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingHotels ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-rose-500 mb-3"></div>
                  <p className="text-slate-400 text-sm font-medium">Fetching registered hotels...</p>
                </div>
              ) : ownerHotels.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Hotel className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-700 mb-1">No Hotels Registered</h4>
                  <p className="text-xs text-slate-400">This hotel owner has not listed any hotels on the platform yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {ownerHotels.map((hotel) => {
                    const mainImage = hotel.hotelImages && hotel.hotelImages.length > 0 ? getImageUrl(hotel.hotelImages[0]) : getImageUrl(null);
                    return (
                      <div key={hotel._id || hotel.id} className="bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
                        <div className="h-44 w-full bg-slate-200 relative overflow-hidden">
                          <img
                            src={mainImage}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop";
                            }}
                          />
                          <div className="absolute top-3 left-3 z-10">
                            {hotel.isApproved ? (
                              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : (
                              <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <Clock size={12} /> Pending
                              </span>
                            )}
                          </div>
                          <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
                            <Bed className="w-3.5 h-3.5 text-rose-400" />
                            {hotel.totalRooms || '0'} Rooms
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-extrabold text-slate-900 leading-tight mb-2">{hotel.name}</h4>
                            <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">{hotel.description || 'No description provided.'}</p>
                          </div>
                          <div className="pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                              <span className="truncate">
                                {[hotel.address?.area, hotel.address?.district, hotel.address?.pincode].filter(Boolean).join(', ') || 'Address N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium px-2">
                Total Hotels: <strong className="text-slate-800">{ownerHotels.length}</strong>
              </span>
              <button
                onClick={() => setShowHotelsModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Detail Modal */}
      {showOwnerModal && selectedOwner && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500" />
                  Owner Verification Profile
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Registration ID: {selectedOwner._id}</p>
              </div>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Owner Profile</h4>
                <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 border border-slate-100 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Full Name</span>
                    <span className="text-slate-900 font-bold">{selectedOwner.user?.name || selectedOwner.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Email Address</span>
                    <span className="text-slate-900 font-semibold">{selectedOwner.user?.email || selectedOwner.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Phone Contact</span>
                    <span className="text-slate-900 font-semibold">{selectedOwner.user?.contact || selectedOwner.contact || selectedOwner.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Gender</span>
                    <span className="text-slate-900 font-semibold capitalize">{selectedOwner.user?.gender || selectedOwner.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Business Name</span>
                    <span className="text-slate-900 font-bold">{selectedOwner.bussinessName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Registration No.</span>
                    <span className="text-slate-900 font-semibold">{selectedOwner.bussinessRegNo}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              {!selectedOwner.isApproved && (
                <>
                  <button
                    onClick={() => triggerApproveOwner(selectedOwner._id, selectedOwner.name)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} /> Approve Owner
                  </button>
                  <button
                    onClick={() => triggerRejectOwner(selectedOwner._id, selectedOwner.name)}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-200/60 flex items-center gap-1 cursor-pointer"
                  >
                    <X size={14} /> Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setShowOwnerModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in duration-200">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${currentAction.type === 'approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
              {currentAction.type === 'approve' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-bold mb-1 text-slate-900 tracking-tight">
              {currentAction.type === 'approve' ? 'Approve Hotel Owner' : 'Reject Hotel Owner'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to {currentAction.type} <strong>{currentAction.ownerName || 'this owner'}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleConfirmation(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmation(true)}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all text-white cursor-pointer ${currentAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                  }`}
              >
                {currentAction.type === 'approve' ? 'Yes, Approve Owner' : 'Yes, Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperHotelAdmin;