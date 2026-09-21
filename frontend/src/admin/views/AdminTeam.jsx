import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserPlus, Key, Trash2, Edit2, CheckCircle2,
  AlertTriangle, Eye, EyeOff, RefreshCw, Lock, Mail, Phone,
  User, ShieldAlert, Sparkles, X, Loader2
} from 'lucide-react';
import {
  getUsersList,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../../lib/cloudflareService';

export function AdminTeam() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' | 'all'
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    phone: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    role: 'admin',
    newPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getUsersList();
      setUsers(Array.isArray(allUsers) ? allUsers : []);
    } catch (err) {
      console.error('Failed to fetch team users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    window.addEventListener('vw_users_updated', loadUsers);
    return () => window.removeEventListener('vw_users_updated', loadUsers);
  }, []);

  const clearFeedback = () => setFeedback({ type: '', message: '' });

  // Generate a random secure temporary password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pw = 'Azim@';
    for (let i = 0; i < 8; i++) {
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: generateStrongPassword(),
      role: 'admin',
      phone: ''
    });
    setShowPassword(true);
    clearFeedback();
    setIsAddModalOpen(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    clearFeedback();

    const res = await createAdminUser(formData);
    setActionLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: `Administrator ${formData.email} registered successfully with PBKDF2 encryption!` });
      setIsAddModalOpen(false);
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to create administrator account.' });
    }
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || '',
      phone: user.phone || '',
      role: user.role || 'admin',
      newPassword: ''
    });
    setShowPassword(false);
    clearFeedback();
    setIsEditModalOpen(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    clearFeedback();

    const res = await updateAdminUser({
      userId: selectedUser.id,
      name: editFormData.name,
      phone: editFormData.phone,
      role: editFormData.role,
      newPassword: editFormData.newPassword
    });
    setActionLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: `User ${selectedUser.email} updated successfully!` });
      setIsEditModalOpen(false);
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update user.' });
    }
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    clearFeedback();
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    clearFeedback();

    const res = await deleteAdminUser({
      userId: selectedUser.id,
      targetEmail: selectedUser.email
    });
    setActionLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: `Access for ${selectedUser.email} revoked successfully.` });
      setIsDeleteModalOpen(false);
      loadUsers();
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to delete user.' });
    }
  };

  const adminsList = users.filter(u => u.role === 'admin' || u.role === 'subadmin' || u.role === 'manager' || u.role === 'staff');
  const displayList = (activeTab === 'admins' ? adminsList : users).filter(u => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const getRoleBadge = (role, email) => {
    const isMaster = email === 'admin@azimcrafts.com';
    if (isMaster) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <ShieldAlert size={12} className="text-amber-600" />
          Master Super-Admin
        </span>
      );
    }
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ShieldCheck size={12} className="text-emerald-600" />
          Administrator
        </span>
      );
    }
    if (role === 'subadmin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          <ShieldCheck size={12} className="text-teal-600" />
          Sub Administrator
        </span>
      );
    }
    if (role === 'manager') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
          <Key size={12} className="text-purple-600" />
          Store Manager
        </span>
      );
    }
    if (role === 'staff') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <User size={12} className="text-blue-600" />
          Staff
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        Customer
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl font-menu">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-[#c8924b]" />
            <span>Admins &amp; Staff Management</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Provision official store administrators, manage RBAC permissions, and update PBKDF2 credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2.5 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh Users"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c8924b] hover:bg-[#b07d3b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <UserPlus size={16} />
            <span>Add Administrator / Staff</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedback.message && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{feedback.message}</span>
          </div>
          <button onClick={clearFeedback} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Security Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c8924b] flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Admins</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{adminsList.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Lock size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Encryption Standard</p>
            <p className="text-sm font-bold text-emerald-900 mt-0.5">PBKDF2 SHA-512 (100k)</p>
            <p className="text-[11px] text-gray-400">Salted Web Crypto Hardware Hashing</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Key size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Database Source</p>
            <p className="text-sm font-bold text-blue-900 mt-0.5">Cloudflare D1 SQL (Live)</p>
            <p className="text-[11px] text-gray-400">Isolated &amp; Token Protected</p>
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-1 w-full sm:w-auto bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'admins'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Admins &amp; Staff ({adminsList.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            All Accounts ({users.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
          />
          <User size={14} className="text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User / Email</th>
                <th className="px-5 py-3.5">Role &amp; Privilege</th>
                <th className="px-5 py-3.5">Contact Phone</th>
                <th className="px-5 py-3.5">Security Level</th>
                <th className="px-5 py-3.5">Created At</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-gray-500">Querying Cloudflare D1 database...</p>
                    </div>
                  </td>
                </tr>
              ) : displayList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">No matching accounts found</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Administrator / Staff" above to provision an account.</p>
                  </td>
                </tr>
              ) : (
                displayList.map((u) => {
                  const isMaster = u.email === 'admin@azimcrafts.com';
                  return (
                    <tr key={u.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            {(u.name || u.email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.name || 'Unnamed User'}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={11} />
                              <span>{u.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        {getRoleBadge(u.role, u.email)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-600">
                        {u.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} className="text-gray-400" />
                            {u.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Lock size={10} />
                          PBKDF2-SHA512
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-gray-600 hover:text-[#c8924b] hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit User & Change Password"
                          >
                            <Edit2 size={15} />
                          </button>

                          {!isMaster && (
                            <button
                              onClick={() => handleOpenDelete(u)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Revoke Access & Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD ADMINISTRATOR / STAFF */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-[#c8924b]">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Add New Administrator</h3>
                  <p className="text-xs text-gray-500">Credentials will be cryptographically hashed with PBKDF2</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexander Wright"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@azimcrafts.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Role &amp; Access
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none bg-white"
                  >
                    <option value="admin">Super Administrator</option>
                    <option value="subadmin">Sub Administrator</option>
                    <option value="manager">Store Manager</option>
                    <option value="staff">Staff Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+61 426 285 439"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, password: generateStrongPassword() })}
                    className="text-[11px] text-[#c8924b] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles size={11} />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Save this password or share it with the administrator.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-[#c8924b] hover:bg-[#b07d3b] text-white rounded-lg transition-colors shadow-xs"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER & CHANGE PASSWORD */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Edit Administrator</h3>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none bg-white"
                  >
                    <option value="admin">Super Administrator</option>
                    <option value="subadmin">Sub Administrator</option>
                    <option value="manager">Store Manager</option>
                    <option value="staff">Staff Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reset Password (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, newPassword: generateStrongPassword() })}
                    className="text-[11px] text-[#c8924b] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles size={11} />
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Leave blank to keep existing password"
                    minLength={6}
                    value={editFormData.newPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  If entered, password will be encrypted with PBKDF2 SHA-512.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-[#c8924b] hover:bg-[#b07d3b] text-white rounded-lg transition-colors shadow-xs"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REVOKE ACCESS / DELETE USER */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Revoke Staff Access?</h3>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to remove administrator permissions for <strong className="text-gray-800">{selectedUser.email}</strong>? This user will immediately lose access to the Admin Dashboard.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAdmin}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Yes, Revoke Access</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
