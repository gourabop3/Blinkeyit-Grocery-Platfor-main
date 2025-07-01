const AddressModel = require("../models/address.model");
const UserModel = require("../models/user.model");

const addAddressController = async (request, response) => {
  try {
    const userId = request.userId; // middleware
    const { address_line, city, state, pincode, country, mobile } =
      request.body;

    // Basic validation
    if (!address_line || !city || !state || !pincode || !country || !mobile) {
      return response.status(400).json({
        message: "Provide address_line, city, state, country, pincode, mobile",
        error: true,
        success: false,
      });
    }

    const createAddress = new AddressModel({
      address_line: address_line.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      pincode: String(pincode).trim(),
      mobile: String(mobile).trim(),
      userId: userId,
    });
    const saveAddress = await createAddress.save();

    const addUserAddressId = await UserModel.findByIdAndUpdate(userId, {
      $push: {
        address_details: saveAddress._id,
      },
    });

    return response.json({
      message: "Address Created Successfully",
      error: false,
      success: true,
      data: saveAddress,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const getAddressController = async (request, response) => {
  try {
    const userId = request.userId; // middleware auth

    const data = await AddressModel.find({ userId: userId }).sort({
      createdAt: -1,
    });

    return response.json({
      data: data,
      message: "List of address",
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

const updateAddressController = async (request, response) => {
  try {
    const userId = request.userId; // middleware auth
    const { _id, address_line, city, state, country, pincode, mobile } =
      request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide address _id",
        error: true,
        success: false,
      });
    }

    if (!address_line && !city && !state && !country && !pincode && !mobile) {
      return response.status(400).json({
        message: "Provide at least one field to update",
        error: true,
        success: false,
      });
    }

    const updateAddress = await AddressModel.updateOne(
      { _id: _id, userId: userId },
      {
        ...(address_line && { address_line }),
        ...(city && { city }),
        ...(state && { state }),
        ...(country && { country }),
        ...(mobile && { mobile }),
        ...(pincode && { pincode }),
      }
    );

    return response.json({
      message: "Address Updated",
      error: false,
      success: true,
      data: updateAddress,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

const deleteAddresscontroller = async (request, response) => {
  try {
    const userId = request.userId; // auth middleware
    const { _id } = request.body;

    const disableAddress = await AddressModel.updateOne(
      { _id: _id, userId },
      {
        status: false,
      }
    );

    return response.json({
      message: "Address remove",
      error: false,
      success: true,
      data: disableAddress,
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
  addAddressController,
  getAddressController,
  updateAddressController,
  deleteAddresscontroller,
};
