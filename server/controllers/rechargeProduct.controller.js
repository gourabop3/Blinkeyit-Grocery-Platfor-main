const RechargeProductModel = require("../models/rechargeProduct.model.js");

const createRechargeProductController = async (request, response) => {
  try {
    const {
      name,
      image,
      category = [],
      subCategory = [],
      type,
      provider,
      denomination,
      price,
      discount = 0,
      description,
      details,
      publish = true,
      isPopular = false,
      isFeatured = false,
      tags = [],
    } = request.body;

    // Sanitize & transform incoming arrays
    const categoryIds = (Array.isArray(category) ? category : [category]).map((c) =>
      typeof c === "string" ? c : c?._id
    ).filter(Boolean);
    const subCategoryIds = (Array.isArray(subCategory) ? subCategory : [subCategory]).map((sc) =>
      typeof sc === "string" ? sc : sc?._id
    ).filter(Boolean);

    // Coerce numeric fields
    const numericDenomination = Number(denomination) || 0;
    const numericPrice = Number(price) || 0;
    const numericDiscount = Number(discount) || 0;

    // Validation
    if (!name || !image?.length || !type || !numericPrice) {
      return response.status(400).json({
        message: "Required fields are missing (name, image, type, price)",
        error: true,
        success: false,
      });
    }

    if (numericDiscount < 0 || numericDiscount > 100) {
      return response.status(400).json({
        message: "Discount must be between 0 and 100",
        error: true,
        success: false,
      });
    }

    const product = new RechargeProductModel({
      name,
      image,
      category: categoryIds,
      subCategory: subCategoryIds,
      type,
      provider,
      denomination: numericDenomination,
      price: numericPrice,
      discount: numericDiscount,
      description,
      details: details || {},
      publish,
      isPopular,
      isFeatured,
      tags: Array.isArray(tags) ? tags : [],
    });

    const saveProduct = await product.save();

    return response.json({
      message: "Recharge Product Created Successfully",
      data: saveProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getRechargeProductController = async (request, response) => {
  try {
    let { page, limit, search, type, category, subCategory, publish } = request.body;

    if (!page) page = 1;
    if (!limit) limit = 10;

    const query = {};

    if (search) {
      query.$text = { $search: search };
    }

    if (type) {
      query.type = type;
    }

    if (category && category.length > 0) {
      query.category = { $in: Array.isArray(category) ? category : [category] };
    }

    if (subCategory && subCategory.length > 0) {
      query.subCategory = { $in: Array.isArray(subCategory) ? subCategory : [subCategory] };
    }

    if (publish !== undefined) {
      query.publish = publish;
    }

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      RechargeProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      RechargeProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Recharge Product data",
      error: false,
      success: true,
      totalCount: totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data: data,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getRechargeProductDetails = async (request, response) => {
  try {
    const { id } = request.params;

    if (!id) {
      return response.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const product = await RechargeProductModel.findById(id)
      .populate("category subCategory");

    if (!product) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Product details",
      data: product,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getRechargeProductByCategory = async (request, response) => {
  try {
    const { id, type } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Please provide a category ID.",
        error: true,
        success: false,
      });
    }

    const query = {
      category: { $in: Array.isArray(id) ? id : [id] },
      publish: true,
    };

    if (type) {
      query.type = type;
    }

    const products = await RechargeProductModel.find(query)
      .populate("category subCategory")
      .limit(50)
      .sort({ isFeatured: -1, isPopular: -1, createdAt: -1 });

    return response.json({
      message: "Category recharge products",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const updateRechargeProductDetails = async (request, response) => {
  try {
    const {
      _id,
      name,
      image,
      category,
      subCategory,
      type,
      provider,
      denomination,
      price,
      discount,
      description,
      details,
      publish,
      isPopular,
      isFeatured,
      tags,
    } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const categoryIds = (Array.isArray(category) ? category : [category])
      .map((c) => (typeof c === "string" ? c : c?._id))
      .filter(Boolean);
    const subCategoryIds = (Array.isArray(subCategory) ? subCategory : [subCategory])
      .map((sc) => (typeof sc === "string" ? sc : sc?._id))
      .filter(Boolean);

    const updateData = {
      name,
      image,
      category: categoryIds,
      subCategory: subCategoryIds,
      type,
      provider,
      denomination: Number(denomination) || 0,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      description,
      details: details || {},
      publish,
      isPopular,
      isFeatured,
      tags: Array.isArray(tags) ? tags : [],
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedProduct = await RechargeProductModel.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("category subCategory");

    if (!updatedProduct) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Product updated successfully",
      data: updatedProduct,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const deleteRechargeProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Product ID is required",
        error: true,
        success: false,
      });
    }

    const deletedProduct = await RechargeProductModel.findByIdAndDelete(_id);

    if (!deletedProduct) {
      return response.status(404).json({
        message: "Product not found",
        error: true,
        success: false,
      });
    }

    return response.json({
      message: "Product deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const searchRechargeProduct = async (request, response) => {
  try {
    const { search, type, limit = 20 } = request.body;

    if (!search) {
      return response.status(400).json({
        message: "Search query is required",
        error: true,
        success: false,
      });
    }

    const query = {
      $text: { $search: search },
      publish: true,
    };

    if (type) {
      query.type = type;
    }

    const products = await RechargeProductModel.find(query)
      .populate("category subCategory")
      .limit(limit)
      .sort({ score: { $meta: "textScore" } });

    return response.json({
      message: "Search results",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = {
  createRechargeProductController,
  getRechargeProductController,
  getRechargeProductDetails,
  getRechargeProductByCategory,
  updateRechargeProductDetails,
  deleteRechargeProductDetails,
  searchRechargeProduct,
};

