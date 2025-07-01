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
} from "react-icons/fi";
import { MdVerified, MdAdminPanelSettings } from "react-icons/md";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data for demonstration
  const mockUsers = [
    {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      mobile: "+91 9876543210",
      role: "GENERAL",
      status: "Active",
      email_verify: true,
      mobile_verify: true,
      createdAt: "2024-01-15T10:30:00Z",
      lastLogin: "2024-01-20T08:45:00Z",
      totalOrders: 12,
      totalSpent: 25999,
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      mobile: "+91 9876543211",
      role: "ADMIN",
      status: "Active",
      email_verify: true,
      mobile_verify: true,
      createdAt: "2024-01-10T15:45:00Z",
      lastLogin: "2024-01-21T09:30:00Z",
      totalOrders: 0,
      totalSpent: 0,
    },
    {
      _id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      mobile: "+91 9876543212",
      role: "GENERAL",
      status: "Inactive",
      email_verify: false,
      mobile_verify: true,
      createdAt: "2024-01-05T09:20:00Z",
      lastLogin: "2024-01-18T14:15:00Z",
      totalOrders: 3,
      totalSpent: 4997,
    },
    {
      _id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      mobile: "+91 9876543213",
      role: "GENERAL",
      status: "Active",
      email_verify: true,
      mobile_verify: false,
      createdAt: "2024-01-12T11:10:00Z",
      lastLogin: "2024-01-21T16:20:00Z",
      totalOrders: 8,
      totalSpent: 15600,
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        let filteredUsers = mockUsers;
        
        if (roleFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
          );
        }
        
        if (statusFilter !== "all") {
          filteredUsers = filteredUsers.filter(
            (user) => user.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
        
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(
            (user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.mobile.includes(searchTerm)
          );
        }
        
        setUsers(filteredUsers);
        setTotalPages(Math.ceil(filteredUsers.length / 10));
        setLoading(false);
      }, 1000);
    } catch (error) {
      AxiosToastError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, searchTerm, page]);

  const updateUserRole = async (userId, newRole) => {
    try {
      // Simulate API call
      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);
      toast.success("User role updated successfully");
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Simulate API call
      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      toast.success("User status updated successfully");
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Simulate API call
        const updatedUsers = users.filter((user) => user._id !== userId);
        setUsers(updatedUsers);
        toast.success("User deleted successfully");
      } catch (error) {
        AxiosToastError(error);
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "GENERAL":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <FiUser className="mr-2" />
                Personal Information
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span> {user.name}
                </p>
                <p className="flex items-center">
                  <FiMail className="mr-2" />
                  <span className="font-medium">Email:</span> {user.email}
                  {user.email_verify && (
                    <MdVerified className="ml-2 text-green-600" />
                  )}
                </p>
                <p className="flex items-center">
                  <FiPhone className="mr-2" />
                  <span className="font-medium">Mobile:</span> {user.mobile}
                  {user.mobile_verify && (
                    <MdVerified className="ml-2 text-green-600" />
                  )}
                </p>
                <p className="flex items-center">
                  <FiCalendar className="mr-2" />
                  <span className="font-medium">Joined:</span>{" "}
                  {formatDate(user.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Last Login:</span>{" "}
                  {formatDate(user.lastLogin)}
                </p>
              </div>
            </div>

            {/* Role and Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Role & Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={user.role}
                    onChange={(e) => updateUserRole(user._id, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="GENERAL">General User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={user.status}
                    onChange={(e) => updateUserStatus(user._id, e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Order Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {user.totalOrders}
                </p>
                <p className="text-gray-600">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ₹{user.totalSpent.toLocaleString()}
                </p>
                <p className="text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => deleteUser(user._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage all registered users</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="general">General User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <FiUser className="text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.mobile}</div>
                    <div className="flex items-center space-x-2">
                      {user.email_verify && (
                        <span className="text-green-600" title="Email Verified">
                          <MdVerified size={16} />
                        </span>
                      )}
                      {user.mobile_verify && (
                        <span className="text-blue-600" title="Mobile Verified">
                          <FiPhone size={14} />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                        user.role
                      )}`}
                    >
                                             {user.role === "ADMIN" && <MdAdminPanelSettings className="mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.totalOrders}</div>
                    <div className="text-xs text-gray-500">
                      ₹{user.totalSpent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

export default UserManagement;