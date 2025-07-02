import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUser,
  FiMoreVertical,
  FiPlus,
} from "react-icons/fi";
import { MdVerified, MdAdminPanelSettings } from "react-icons/md";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const ModernUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users with filters:", { page, roleFilter, statusFilter, searchTerm });
      
      const response = await Axios({
        ...SummaryApi.getAllUsers,
        params: {
          page,
          limit: 10,
          role: roleFilter !== "all" ? roleFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: searchTerm || undefined,
        },
      });

      console.log("Users API response:", response.data);

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Users API Error:", error);
      AxiosToastError(error);
      // Set empty array on error
      setUsers([]);
      setPagination({});
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, searchTerm, page]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateUserRole,
        url: `${SummaryApi.updateUserRole.url}/${userId}`,
        data: { role: newRole },
      });

      if (response.data.success) {
        // Update the user in the local state
        const updatedUsers = users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        toast.success("User role updated successfully");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Update role error:", error);
      AxiosToastError(error);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const response = await Axios({
        ...SummaryApi.updateUserRole,
        url: `${SummaryApi.updateUserRole.url}/${userId}`,
        data: { status: newStatus },
      });

      if (response.data.success) {
        // Update the user in the local state
        const updatedUsers = users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        toast.success("User status updated successfully");
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Update status error:", error);
      AxiosToastError(error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await Axios({
          ...SummaryApi.deleteUser,
          url: `${SummaryApi.deleteUser.url}/${userId}`,
        });

        if (response.data.success) {
          // Remove the user from the local state
          const updatedUsers = users.filter((user) => user._id !== userId);
          setUsers(updatedUsers);
          toast.success("User deleted successfully");
          
          // Refresh data if current page becomes empty
          if (updatedUsers.length === 0 && page > 1) {
            setPage(page - 1);
          } else {
            fetchUsers(); // Refresh to get updated pagination
          }
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error("Delete user error:", error);
        AxiosToastError(error);
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "GENERAL":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const UserDetailsModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Information */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">
                <FiUser className="mr-3 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FiMail className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  {user.email_verify && (
                    <MdVerified className="ml-2 text-green-600" />
                  )}
                </div>
                <div className="flex items-center">
                  <FiPhone className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-700">Mobile:</span>
                    <p className="text-gray-900">{user.mobile}</p>
                  </div>
                  {user.mobile_verify && (
                    <MdVerified className="ml-2 text-green-600" />
                  )}
                </div>
                <div className="flex items-center">
                  <FiCalendar className="mr-3 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-700">Joined:</span>
                    <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Role & Status</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GENERAL">General User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={user.status}
                    onChange={(e) => updateUserStatus(user._id, e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="mt-8 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100">
            <h3 className="font-bold text-lg mb-6 text-gray-900">Order Statistics</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center bg-white p-4 rounded-xl">
                <p className="text-3xl font-bold text-blue-600">
                  {user.totalOrders || 0}
                </p>
                <p className="text-gray-600 font-medium">Total Orders</p>
              </div>
              <div className="text-center bg-white p-4 rounded-xl">
                <p className="text-3xl font-bold text-green-600">
                  ₹{(user.totalSpent || 0).toLocaleString()}
                </p>
                <p className="text-gray-600 font-medium">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => deleteUser(user._id)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FiTrash2 size={16} />
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all registered users</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
          <FiPlus size={16} />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="general">General User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserDetails(true);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <FiMoreVertical size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                  {user.role === "ADMIN" && <MdAdminPanelSettings className="mr-1" />}
                  {user.role}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                {user.email_verify && (
                  <div className="flex items-center text-green-600 text-xs">
                    <MdVerified className="mr-1" />
                    Email
                  </div>
                )}
                {user.mobile_verify && (
                  <div className="flex items-center text-blue-600 text-xs">
                    <FiPhone className="mr-1" />
                    Mobile
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{user.totalOrders || 0}</p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">₹{(user.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Spent</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserDetails(true);
                }}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 text-sm font-medium transition-colors"
              >
                <FiEye size={14} />
                View
              </button>
              <button
                onClick={() => deleteUser(user._id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center text-sm transition-colors"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {page} of {totalPages} ({pagination.totalUsers} total users)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default ModernUserManagement;