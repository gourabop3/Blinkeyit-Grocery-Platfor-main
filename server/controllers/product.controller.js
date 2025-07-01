const ProductModel = require("../models/product.model.js");

const createProductController = async (request, response) => {
  try {
    const {
      name,
      image,
      category = [],
      subCategory = [],
      unit,
      stock,
      price,
      discount = 0,
      description,
      more_details,
    } = request.body;

    // ✅ Sanitize & transform incoming arrays (may contain full objects from client)
    const categoryIds = (Array.isArray(category) ? category : [category]).map((c) =>
      typeof c === "string" ? c : c?._id
    );
    const subCategoryIds = (Array.isArray(subCategory) ? subCategory : [subCategory]).map((sc) =>
      typeof sc === "string" ? sc : sc?._id
    );

    // ✅ Coerce numeric fields to Number for consistency
    const numericStock = Number(stock) || 0;
    const numericPrice = Number(price) || 0;
    const numericDiscount = Number(discount) || 0;

    // ✅ Validation
    if (
      !name ||
      !image?.length ||
      !categoryIds.length ||
      !subCategoryIds.length ||
      !unit ||
      !numericPrice ||
      !description
    ) {
      return response.status(400).json({
        message: "Required fields are missing",
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

    const product = new ProductModel({
      name,
      image,
      category: categoryIds,
      subCategory: subCategoryIds,
      unit,
      stock: numericStock,
      price: numericPrice,
      discount: numericDiscount,
      description,
      more_details,
    });
    const saveProduct = await product.save();

    return response.json({
      message: "Product Created Successfully",
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

const getProductController = async (request, response) => {
  try {
    let { page, limit, search } = request.body;

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 10;
    }

    const query = search
      ? {
          $text: {
            $search: search,
          },
        }
      : {};

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product data",
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

// const getProductByCategory = async (request, response) => {
//   try {
//     const { id } = request.body;

//     if (!id) {
//       return response.status(400).json({
//         message: "provide category id",
//         error: true,
//         success: false,
//       });
//     }

//     const product = await ProductModel.find({
//       category: { $in: id },
//     }).limit(15);

//     return response.json({
//       message: "category product list",
//       data: product,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// };

const getProductByCategory = async (request, response) => {
  try {
    const { id } = request.body;

    if (!id) {
      return response.status(400).json({
        message: "Please provide a category ID.",
        error: true,
        success: false,
      });
    }

    // Ensure `id` is used with $in properly if it's not an array
    const query = Array.isArray(id) ? { $in: id } : id;

    const products = await ProductModel.find({
      category: query,
    }).limit(15);

    return response.status(200).json({
      message: "Category product list fetched successfully.",
      data: products,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("getProductByCategory Error:", error);
    return response.status(500).json({
      message: error.message || "Something went wrong.",
      error: true,
      success: false,
    });
  }
};

const getProductByCategoryAndSubCategory = async (request, response) => {
  try {
    let { categoryId, subCategoryId, page, limit } = request.body;

    if (!categoryId || !subCategoryId) {
      return response.status(400).json({
        message: "Provide categoryId and subCategoryId",
        error: true,
        success: false,
      });
    }

    // Ensure both are arrays
    if (!Array.isArray(categoryId)) categoryId = [categoryId];
    if (!Array.isArray(subCategoryId)) subCategoryId = [subCategoryId];

    page = Number(page) || 1;
    limit = Number(limit) || 10;

    const query = {
      category: { $in: categoryId },
      subCategory: { $in: subCategoryId },
    };

    const skip = (page - 1) * limit;

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product list",
      data: data,
      totalCount: dataCount,
      page: page,
      limit: limit,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getProductDetails = async (request, response) => {
  try {
    const { productId } = request.body;

    const product = await ProductModel.findOne({ _id: productId });

    return response.json({
      message: "product details",
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

//update product
const updateProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "provide product _id",
        error: true,
        success: false,
      });
    }

    // Extract allowed fields and sanitize
    const {
      name,
      image,
      category = [],
      subCategory = [],
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
      publish,
    } = request.body;

    const categoryIds = (Array.isArray(category) ? category : [category]).map((c) =>
      typeof c === "string" ? c : c?._id
    );
    const subCategoryIds = (Array.isArray(subCategory) ? subCategory : [subCategory]).map((sc) =>
      typeof sc === "string" ? sc : sc?._id
    );

    const payload = {
      ...(name && { name }),
      ...(Array.isArray(image) && image.length && { image }),
      ...(categoryIds.length && { category: categoryIds }),
      ...(subCategoryIds.length && { subCategory: subCategoryIds }),
      ...(unit && { unit }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(price !== undefined && { price: Number(price) }),
      ...(discount !== undefined && { discount: Number(discount) }),
      ...(description && { description }),
      ...(more_details && { more_details }),
      ...(typeof publish === "boolean" && { publish }),
    };

    if (discount !== undefined) {
      const discNum = Number(discount);
      if (isNaN(discNum) || discNum < 0 || discNum > 100) {
        return response.status(400).json({
          message: "Discount must be between 0 and 100",
          error: true,
          success: false,
        });
      }
    }

    const updateProduct = await ProductModel.updateOne({ _id }, payload);

    return response.json({
      message: "updated successfully",
      data: updateProduct,
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

//delete product
const deleteProductDetails = async (request, response) => {
  try {
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "provide _id ",
        error: true,
        success: false,
      });
    }

    const deleteProduct = await ProductModel.deleteOne({ _id: _id });

    return response.json({
      message: "Delete successfully",
      error: false,
      success: true,
      data: deleteProduct,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

//search product
const searchProduct = async (request, response) => {
  try {
    let { search, page, limit } = request.body;

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 10;
    }

    const query = search
      ? {
          $text: {
            $search: search,
          },
        }
      : {};

    const skip = (page - 1) * limit;

    const [data, dataCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product data",
      error: false,
      success: true,
      data: data,
      totalCount: dataCount,
      totalPage: Math.ceil(dataCount / limit),
      page: page,
      limit: limit,
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
  createProductController,
  getProductController,
  getProductByCategory,
  getProductByCategoryAndSubCategory,
  getProductDetails,
  updateProductDetails,
  deleteProductDetails,
  searchProduct,
};
