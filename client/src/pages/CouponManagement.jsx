import React, { useEffect, useState } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    expiresAt: '',
    usageLimit: '',
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.listCoupons,
      });
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (err) {
      AxiosToastError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.code || !payload.discountValue) {
        toast.error('Code and discount value are required');
        return;
      }
      const response = await Axios({
        ...SummaryApi.createCoupon,
        data: payload,
      });
      if (response.data.success) {
        toast.success('Coupon created');
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderValue: '',
          maxDiscount: '',
          expiresAt: '',
          usageLimit: '',
        });
        fetchCoupons();
      }
    } catch (err) {
      AxiosToastError(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const response = await Axios({
        ...SummaryApi.deleteCoupon,
        url: `${SummaryApi.deleteCoupon.url}/${id}`,
      });
      if (response.data.success) {
        toast.success('Deleted');
        fetchCoupons();
      }
    } catch (err) {
      AxiosToastError(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Coupon Management</h1>

      {/* Create coupon form */}
      <form
        className="bg-white p-6 rounded-lg shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={handleCreateCoupon}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <input
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="SAVE10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount Type</label>
          <select
            name="discountType"
            value={formData.discountType}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount Value</label>
          <input
            name="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Min Order Value</label>
          <input
            name="minOrderValue"
            type="number"
            value={formData.minOrderValue}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Discount (optional)</label>
          <input
            name="maxDiscount"
            type="number"
            value={formData.maxDiscount}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
            placeholder=""
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expires At</label>
          <input
            name="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Usage Limit (0 = unlimited)</label>
          <input
            name="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <FiPlus /> Create Coupon
          </button>
        </div>
      </form>

      {/* Coupon list */}
      <h2 className="text-xl font-semibold mb-3">Existing Coupons</h2>
      {loading ? (
        <p>Loading...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-500">No coupons found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold">
                    {c.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}%`
                      : `₹${c.discountValue}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;