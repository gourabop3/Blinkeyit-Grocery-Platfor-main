import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiUpload,
  FiX,
  FiImage,
  FiSave,
  FiArrowLeft,
  FiDollarSign,
  FiPackage,
  FiTag,
  FiGrid,
  FiLayers,
  FiInfo,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const ModernAddProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing products
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    more_details: {},
  });

  const [newDetailKey, setNewDetailKey] = useState("");
  const [newDetailValue, setNewDetailValue] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getCategory,
        data: {}
      });
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getSubCategory,
        data: {}
      });
      if (response.data.success) {
        setSubCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch sub-categories:", error);
    }
  };

  const fetchProductData = async () => {
    if (!isEditing) return;
    
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: { productId: id }
      });
      
      if (response.data.success) {
        const product = response.data.data;
        setFormData({
          name: product.name || "",
          description: product.description || "",
          image: product.image || [],
          category: product.category || [],
          subCategory: product.subCategory || [],
          unit: product.unit || "",
          stock: product.stock || "",
          price: product.price || "",
          discount: product.discount || "",
          more_details: product.more_details || {},
        });
      }
    } catch (error) {
      AxiosToastError(error);
      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    fetchProductData();
  }, [id]);

  const handleImageUpload = async (files) => {
    if (!files.length) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        
        const response = await Axios({
          ...SummaryApi.uploadImage,
          data: formData,
        });
        
        return response.data.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        image: [...prev.image, ...uploadedUrls]
      }));
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      image: prev.image.filter((_, i) => i !== index)
    }));
  };

  const handleCategorySelect = (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    if (category && !formData.category.find(c => c._id === categoryId)) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, category]
      }));
    }
  };

  const handleSubCategorySelect = (subCategoryId) => {
    const subCategory = subCategories.find(sc => sc._id === subCategoryId);
    if (subCategory && !formData.subCategory.find(sc => sc._id === subCategoryId)) {
      setFormData(prev => ({
        ...prev,
        subCategory: [...prev.subCategory, subCategory]
      }));
    }
  };

  const removeCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter(c => c._id !== categoryId)
    }));
  };

  const removeSubCategory = (subCategoryId) => {
    setFormData(prev => ({
      ...prev,
      subCategory: prev.subCategory.filter(sc => sc._id !== subCategoryId)
    }));
  };

  const addDetail = () => {
    if (newDetailKey && newDetailValue) {
      setFormData(prev => ({
        ...prev,
        more_details: {
          ...prev.more_details,
          [newDetailKey]: newDetailValue
        }
      }));
      setNewDetailKey("");
      setNewDetailValue("");
    }
  };

  const removeDetail = (key) => {
    setFormData(prev => {
      const newDetails = { ...prev.more_details };
      delete newDetails[key];
      return {
        ...prev,
        more_details: newDetails
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    
    if (!formData.price) {
      toast.error("Product price is required");
      return;
    }

    if (formData.category.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios({
        ...(isEditing ? SummaryApi.updateProductDetails : SummaryApi.createProduct),
        data: isEditing ? { ...formData, _id: id } : formData,
      });

      if (response.data.success) {
        toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate("/admin/products");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/products")}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <HiSparkles className="w-8 h-8 text-blue-600 mr-3" />
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? "Update product information" : "Create a new product for your store"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiInfo className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., kg, piece, liter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Available quantity"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiDollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount (%)
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiImage className="w-5 h-5 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
          </div>

          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {uploadingImages ? "Uploading..." : "Upload Product Images"}
              </p>
              <p className="text-sm text-gray-500">
                Drop files here or click to browse. Support PNG, JPG up to 10MB
              </p>
            </label>
          </div>

          {/* Uploaded Images */}
          {formData.image.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Images ({formData.image.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.image.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiGrid className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Categories *</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Categories
              </label>
              <select
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value=""
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              {/* Selected Categories */}
              {formData.category.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.category.map((category) => (
                    <span
                      key={category._id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {category.name}
                      <button
                        type="button"
                        onClick={() => removeCategory(category._id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sub Categories
              </label>
              <select
                onChange={(e) => handleSubCategorySelect(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value=""
              >
                <option value="">Choose a sub category</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              
              {/* Selected Sub Categories */}
              {formData.subCategory.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.subCategory.map((subCategory) => (
                    <span
                      key={subCategory._id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {subCategory.name}
                      <button
                        type="button"
                        onClick={() => removeSubCategory(subCategory._id)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <FiTag className="w-5 h-5 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Additional Details</h2>
          </div>

          {/* Add New Detail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={newDetailKey}
              onChange={(e) => setNewDetailKey(e.target.value)}
              placeholder="Detail name (e.g., Brand, Material)"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={newDetailValue}
              onChange={(e) => setNewDetailValue(e.target.value)}
              placeholder="Detail value"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addDetail}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Detail
            </button>
          </div>

          {/* Existing Details */}
          {Object.entries(formData.more_details).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.more_details).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="ml-2 text-gray-600">{value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDetail(key)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                {isEditing ? "Update Product" : "Create Product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModernAddProduct;