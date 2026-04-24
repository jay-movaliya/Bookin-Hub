import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function SuperHotelAdmin() {
  const [approvedOwners, setApprovedOwners] = useState([]);
  const [unapprovedOwners, setUnapprovedOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('unapproved');
  const [ownerHotels, setOwnerHotels] = useState([]);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentAction, setCurrentAction] = useState({ type: '', ownerId: null });
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
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
        setApprovedOwners(data.data);
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
        setUnapprovedOwners(data.data);
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
  const fetchOwnerHotels = async (ownerId) => {
    try {

      // Option 2: Using query parameters(alternative)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hotel/admin/get-owner-hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ownerId }),
      });

      const data = await response.json();

      if (response.ok) {
        setOwnerHotels(data.data);
        setShowHotelsModal(true);
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
          // Refetch both lists to ensure data is fresh
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
          // Refetch the unapproved list
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
  // Open confirmation modal
  const openConfirmationModal = (type, ownerId) => {
    setCurrentAction({ type, ownerId });
    setShowConfirmationModal(true);
  };

  // Fetch owners on initial load
  useEffect(() => {
    fetchApprovedOwners();
    fetchUnapprovedOwners();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-slate-800 py-6 px-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Hotel Admin Dashboard
          </h1>
          <p className="text-slate-500">Manage and oversee hotel partnerships across the platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-slate-200 mb-8">
          <button
            className={`px-6 py-3.5 font-medium text-sm rounded-t-lg transition-all duration-200 relative ${activeTab === 'unapproved' ? 'text-red-600 bg-red-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('unapproved')}
          >
            Pending Approval
            <span className="ml-2 inline-flex items-center justify-center bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{unapprovedOwners.length}</span>
            {activeTab === 'unapproved' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 rounded-t-full"></div>}
          </button>
          <button
            className={`px-6 py-3.5 font-medium text-sm rounded-t-lg transition-all duration-200 relative ${activeTab === 'approved' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Owners
            <span className={`ml-2 inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{approvedOwners.length}</span>
            {activeTab === 'approved' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 rounded-t-full"></div>}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-red-500"></div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl flex items-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
            {/* Unapproved Owners Table */}
            {activeTab === 'unapproved' && (
              <div>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Owners Pending Approval</h2>
                </div>
                {unapprovedOwners.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    No owners pending approval
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                          <th className="px-6 py-4 text-left font-semibold">Business Name</th>
                          <th className="px-6 py-4 text-left font-semibold">Business Reg. No.</th>
                          <th className="px-6 py-4 text-left font-semibold">Owner Name</th>
                          <th className="px-6 py-4 text-left font-semibold">Email</th>
                          <th className="px-6 py-4 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unapprovedOwners.map((owner) => (
                          <tr
                            key={owner._id}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 font-medium text-slate-800">{owner.bussinessName}</td>
                            <td className="px-6 py-4 text-slate-600">{owner.bussinessRegNo}</td>
                            <td className="px-6 py-4 text-slate-600">{owner.name}</td>
                            <td className="px-6 py-4 text-slate-500">{owner.email}</td>
                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={() => openConfirmationModal('approve', owner._id)}
                                className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium text-sm transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openConfirmationModal('reject', owner._id)}
                                className="px-4 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Approved Owners Table */}
            {activeTab === 'approved' && (
              <div>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Approved Owners</h2>
                </div>
                {approvedOwners.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    No approved owners yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                          <th className="px-6 py-4 text-left font-semibold">Business Name</th>
                          <th className="px-6 py-4 text-left font-semibold">Business Reg. No.</th>
                          <th className="px-6 py-4 text-left font-semibold">Owner Name</th>
                          <th className="px-6 py-4 text-left font-semibold">Email</th>
                          <th className="px-6 py-4 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedOwners.map((owner) => (
                          <tr
                            key={owner._id}
                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 font-medium text-slate-800">{owner.bussinessName}</td>
                            <td className="px-6 py-4 text-slate-600">{owner.bussinessRegNo}</td>
                            <td className="px-6 py-4 text-slate-600">{owner.name}</td>
                            <td className="px-6 py-4 text-slate-500">{owner.email}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => viewOwnerDetails(owner)}
                                className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-colors"
                              >
                                View Details
                              </button>
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
        )}
      </div>

      {showOwnerModal && selectedOwner && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-0 rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 max-h-[90vh] overflow-y-auto overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Owner Details</h3>
              <button
                onClick={() => setShowOwnerModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-white hover:bg-slate-100 rounded-full p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Info</h4>
                  <div className="space-y-3">
                    <p className="text-slate-600"><span className="block text-xs font-semibold text-slate-400 mb-1">Name</span> <span className="text-slate-800 font-medium">{selectedOwner.name}</span></p>
                    <p className="text-slate-600"><span className="block text-xs font-semibold text-slate-400 mb-1">Email</span> <span className="text-slate-800 font-medium">{selectedOwner.email}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Business Info</h4>
                  <div className="space-y-3">
                    <p className="text-slate-600"><span className="block text-xs font-semibold text-slate-400 mb-1">Business Name</span> <span className="text-slate-800 font-medium">{selectedOwner.bussinessName}</span></p>
                    <p className="text-slate-600"><span className="block text-xs font-semibold text-slate-400 mb-1">Registration No</span> <span className="text-slate-800 font-medium">{selectedOwner.bussinessRegNo}</span></p>
                    <p className="text-slate-600"><span className="block text-xs font-semibold text-slate-400 mb-1">Address</span> <span className="text-slate-800 font-medium">{selectedOwner.address || 'N/A'}</span></p>
                  </div>
                </div>
              </div>
              {activeTab === 'approved' && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setShowOwnerModal(false);
                      fetchOwnerHotels(selectedOwner._id);
                    }}
                    className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                  >
                    View Registered Hotels
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hotels Modal */}
      {showHotelsModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-100 p-6 bg-slate-50/50">
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
                Registered Hotels
              </h3>
              <button
                onClick={() => setShowHotelsModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 rounded-full p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {ownerHotels.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-1">No hotels found</h4>
                  <p className="text-slate-500">This owner hasn't registered any hotels yet.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-slate-100">
                    <tr className="text-slate-500 text-sm">
                      <th className="px-6 py-4 text-left font-semibold">Hotel Name</th>
                      <th className="px-6 py-4 text-left font-semibold">Location</th>
                      <th className="px-6 py-4 text-left font-semibold">Rooms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerHotels.map((hotel) => (
                      <tr key={hotel.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{hotel.name}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {hotel.address.area}, {hotel.address.district}, {hotel.address.pincode}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {hotel.totalRooms || '0'} Rooms
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowHotelsModal(false)}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-slate-700 font-medium transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-slate-900/40 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-800 tracking-tight">
              {currentAction.type === 'approve' ? 'Approve Owner' : 'Reject Owner'}
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to {currentAction.type} this owner? This action may trigger notifications and status changes.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleConfirmation(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmation(true)}
                className={`px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors text-white ${currentAction.type === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
                  }`}
              >
                {currentAction.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperHotelAdmin;