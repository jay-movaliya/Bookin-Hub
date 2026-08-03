import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
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
  Calendar,
  Bed,
  Hotel,
  AlertCircle
} from 'lucide-react';

function SuperHotelAdmin({ defaultTab = 'approved' }) {
  const [approvedOwners, setApprovedOwners] = useState([]);
  const [unapprovedOwners, setUnapprovedOwners] = useState([]);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotels for a specific owner
  const fetchOwnerHotels = async (owner) => {
    setSelectedOwner(owner);
    setLoadingHotels(true);
    setShowHotelsModal(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/get-owner-hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Handle confirmation modal actions
  const handleConfirmation = async (confirmed) => {
    setShowConfirmationModal(false);
    if (!confirmed) return;

    const { type, ownerId } = currentAction;
    setLoading(true);

    try {
      if (type === 'approve') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/owner/admin/approve-owner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
          headers: {
            'Content-Type': 'application/json',
          },
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

  const viewOwnerDetails = (owner) => {
    setSelectedOwner(owner);
    setShowOwnerModal(true);
  };

  const openConfirmationModal = (type, ownerId, ownerName = '') => {
    setCurrentAction({ type, ownerId, ownerName });
    setShowConfirmationModal(true);
  };

  useEffect(() => {
    fetchApprovedOwners();
    fetchUnapprovedOwners();
  }, []);

  // Filter owners by search query
  const filterList = (list) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.bussinessName && item.bussinessName.toLowerCase().includes(q)) ||
        (item.bussinessRegNo && item.bussinessRegNo.toLowerCase().includes(q)) ||
        (item.email && item.email.toLowerCase().includes(q))
    );
  };

  const currentList = activeTab === 'approved' ? filterList(approvedOwners) : filterList(unapprovedOwners);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 py-6 px-2">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {activeTab === 'approved' ? (
                <>
                  <ShieldCheck className="text-emerald-500 w-8 h-8" />
                  Approved Hotel Owners
                </>
              ) : (
                <>
                  <Clock className="text-amber-500 w-8 h-8" />
                  Pending Hotel Owners
                </>
              )}
            </h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'approved'
                ? 'Manage approved hotel partners and inspect their registered properties'
                : 'Review, verify, approve, or reject pending hotel owner applications'}
            </p>
          </div>
        </div>

        {/* Metric Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {activeTab === 'approved' ? (
            <>
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
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">OTP Verified</p>
                  <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                    {approvedOwners.filter((o) => o.isVerifiedOtp).length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Partners</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                    {approvedOwners.length + unapprovedOwners.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Rate</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                    {approvedOwners.length + unapprovedOwners.length > 0
                      ? `${Math.round((approvedOwners.length / (approvedOwners.length + unapprovedOwners.length)) * 100)}%`
                      : '0%'}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                  <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{unapprovedOwners.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required</p>
                  <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{unapprovedOwners.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">OTP Verified</p>
                  <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                    {unapprovedOwners.filter((o) => o.isVerifiedOtp).length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                    {approvedOwners.length + unapprovedOwners.length}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Bar Block */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {activeTab === 'approved' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Approved Hotel Owners Directory
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Hotel Owners List
              </>
            )}
          </h2>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'approved'
                  ? 'Search approved owners or reg no...'
                  : 'Search pending owners or reg no...'
              }
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
            <p className="text-slate-400 text-sm font-medium">Loading partner data...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center shadow-sm">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : (
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
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                              {owner.name ? owner.name.charAt(0).toUpperCase() : 'O'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">{owner.name}</div>
                              <div className="text-xs text-slate-400">Hotel Owner</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {owner.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {owner.isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 w-fit">
                                <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
                              </span>
                            )}
                            {owner.isVerifiedOtp && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
                                <ShieldCheck className="w-3 h-3" /> OTP Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDate(owner.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === 'unapproved' && (
                              <>
                                <button
                                  onClick={() => openConfirmationModal('approve', owner._id, owner.name)}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-all flex items-center gap-1 border border-emerald-200/60 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => openConfirmationModal('reject', owner._id, owner.name)}
                                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-all flex items-center gap-1 border border-rose-200/60 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => viewOwnerDetails(owner)}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            {activeTab === 'approved' && (
                              <button
                                onClick={() => fetchOwnerHotels(owner)}
                                className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer border border-rose-100"
                              >
                                <Hotel className="w-3.5 h-3.5" /> Hotels
                              </button>
                            )}
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

      {/* Owner Details Modal */}
      {showOwnerModal && selectedOwner && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-rose-500/20 border-2 border-white/20">
                  {selectedOwner.name ? selectedOwner.name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedOwner.name}</h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-rose-400" />
                    {selectedOwner.bussinessName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Quick Badges */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedOwner.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedOwner.isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {selectedOwner.isApproved ? 'Approved Partner' : 'Pending Approval'}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  selectedOwner.isVerifiedOtp ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {selectedOwner.isVerifiedOtp ? 'Email OTP Verified' : 'OTP Pending'}
                </span>
                {selectedOwner.createdAt && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Joined {formatDate(selectedOwner.createdAt)}
                  </span>
                )}
              </div>

              {/* Personal & Account Information */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Owner Information</h4>
                <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 border border-slate-100 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Full Name</span>
                    <span className="text-slate-900 font-bold">{selectedOwner.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Email Address</span>
                    <span className="text-slate-900 font-semibold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedOwner.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">System ID</span>
                    <span className="text-slate-500 font-mono text-xs">{selectedOwner._id}</span>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Business Information</h4>
                <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3 border border-slate-100 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Business Name</span>
                    <span className="text-slate-900 font-bold">{selectedOwner.bussinessName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                    <span className="text-slate-500 font-medium">Registration No.</span>
                    <span className="text-slate-900 font-semibold">{selectedOwner.bussinessRegNo}</span>
                  </div>
                  {selectedOwner.address && (
                    <div className="flex justify-between items-start py-1">
                      <span className="text-slate-500 font-medium">Address</span>
                      <span className="text-slate-900 font-semibold text-right max-w-xs">{selectedOwner.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              {selectedOwner.isApproved ? (
                <button
                  onClick={() => {
                    setShowOwnerModal(false);
                    fetchOwnerHotels(selectedOwner);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Hotel className="w-4 h-4" />
                  View Registered Hotels
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowOwnerModal(false);
                      openConfirmationModal('approve', selectedOwner._id, selectedOwner.name);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Owner
                  </button>
                  <button
                    onClick={() => {
                      setShowOwnerModal(false);
                      openConfirmationModal('reject', selectedOwner._id, selectedOwner.name);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-rose-200/60"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowOwnerModal(false)}
                className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                          <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
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
                            {hotel.createdAt && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                Registered {formatDate(hotel.createdAt)}
                              </div>
                            )}
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

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 animate-in fade-in duration-200">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              currentAction.type === 'approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {currentAction.type === 'approve' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-bold mb-1 text-slate-900 tracking-tight">
              {currentAction.type === 'approve' ? 'Approve Hotel Owner' : 'Reject Hotel Owner'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to {currentAction.type} <strong>{currentAction.ownerName || 'this owner'}</strong>?
              {currentAction.type === 'approve' ? ' They will receive an approval confirmation email and full access to their dashboard.' : ' This will reject their owner registration request.'}
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
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all text-white cursor-pointer ${
                  currentAction.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
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