import React, { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import toast from "react-hot-toast";
import EditRechargeProductAdmin from "./EditRechargeProductAdmin";

const RechargeProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleDelete = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteRechargeProduct,
        data: {
          _id: data._id,
        },
      });

      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        fetchProductData && fetchProductData();
        setOpenDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      mobile_recharge: "bg-blue-100 text-blue-800",
      bill_payment: "bg-green-100 text-green-800",
      ai_tool: "bg-purple-100 text-purple-800",
      streaming: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  return (
    <>
      <div className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 flex flex-col gap-3">
        {data.isFeatured && (
          <span className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-medium px-2 py-1 rounded-bl-xl">
            ⭐ Featured
          </span>
        )}
        {data.isPopular && (
          <span className="absolute top-0 left-0 bg-orange-400 text-black text-xs font-medium px-2 py-1 rounded-br-xl">
            🔥 Popular
          </span>
        )}
        <div className="w-full h-32 overflow-hidden flex justify-center items-center bg-gray-100 rounded-md">
          <img
            src={data?.image?.[0] || "/placeholder.png"}
            alt={data?.name}
            className="object-contain w-full h-full"
          />
        </div>

        <div className="text-sm font-semibold line-clamp-2 text-gray-800">
          {data?.name}
        </div>
        
        {data.provider && (
          <div className="text-xs text-gray-500">Provider: {data.provider}</div>
        )}

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(data.type)}`}>
            {data.type?.replace('_', ' ')}
          </span>
          {data.denomination > 0 && (
            <span className="text-xs text-gray-600">₹{data.denomination}</span>
          )}
        </div>

        <div className="flex justify-between gap-2 mt-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <MdEdit size={16} />
            Edit
          </button>
          <button
            onClick={() => setOpenDelete(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <MdDelete size={16} />
            Delete
          </button>
        </div>
      </div>

      {editOpen && (
        <EditRechargeProductAdmin
          close={() => setEditOpen(false)}
          data={data}
          fetchProductData={fetchProductData}
        />
      )}

      {openDelete && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{data.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setOpenDelete(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RechargeProductCardAdmin;

