import React, { useState } from 'react'
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import { ClipLoader } from "react-spinners";

const EditRechargeProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name || "",
    image: propsData.image || [],
    category: propsData.category || [],
    subCategory: propsData.subCategory || [],
    type: propsData.type || "mobile_recharge",
    provider: propsData.provider || "",
    denomination: propsData.denomination || "",
    price: propsData.price || "",
    discount: propsData.discount || "",
    description: propsData.description || "",
    details: propsData.details || {
      validity: "",
      data: "",
      benefits: [],
      operator: "",
      circle: "",
    },
    publish: propsData.publish !== undefined ? propsData.publish : true,
    isPopular: propsData.isPopular || false,
    isFeatured: propsData.isFeatured || false,
    tags: propsData.tags || [],
  })
  const [imageLoading, setImageLoading] = useState(false)
  const [ViewImageURL, setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory, setSelectCategory] = useState("")
  const [selectSubCategory, setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)
  const [newBenefit, setNewBenefit] = useState("")
  const [newTag, setNewTag] = useState("")

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith("details.")) {
      const detailField = name.split(".")[1]
      setData((preve) => ({
        ...preve,
        details: {
          ...preve.details,
          [detailField]: value,
        },
      }))
    } else {
      setData((preve) => ({
        ...preve,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data: ImageResponse } = response
    const imageUrl = ImageResponse.data.url

    setData((preve) => ({
      ...preve,
      image: [...preve.image, imageUrl],
    }))
    setImageLoading(false)
  }

  const handleDeleteImage = (index) => {
    setData((preve) => ({
      ...preve,
      image: preve.image.filter((_, i) => i !== index),
    }))
  }

  const handleRemoveCategory = (index) => {
    setData((preve) => ({
      ...preve,
      category: preve.category.filter((_, i) => i !== index),
    }))
  }

  const handleRemoveSubCategory = (index) => {
    setData((preve) => ({
      ...preve,
      subCategory: preve.subCategory.filter((_, i) => i !== index),
    }))
  }

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setData((preve) => ({
        ...preve,
        details: {
          ...preve.details,
          benefits: [...(preve.details.benefits || []), newBenefit.trim()],
        },
      }))
      setNewBenefit("")
    }
  }

  const handleRemoveBenefit = (index) => {
    setData((preve) => ({
      ...preve,
      details: {
        ...preve.details,
        benefits: preve.details.benefits.filter((_, i) => i !== index),
      },
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      setData((preve) => ({
        ...preve,
        tags: [...(preve.tags || []), newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (index) => {
    setData((preve) => ({
      ...preve,
      tags: preve.tags.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await Axios({
        ...SummaryApi.updateRechargeProductDetails,
        data: data
      })
      const { data: responseData } = response

      if (responseData.success) {
        successAlert(responseData.message)
        if (close) {
          close()
        }
        fetchProductData && fetchProductData()
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='fixed top-0 right-0 left-0 bottom-0 bg-black z-50 bg-opacity-70 p-4'>
      <div className='bg-white w-full p-4 max-w-2xl mx-auto rounded overflow-y-auto h-full max-h-[95vh]'>
        <section className=''>
          <div className='p-2 bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold text-xl'>Edit Recharge Product</h2>
            <button onClick={close}>
              <IoClose size={20} />
            </button>
          </div>
          <div className='grid p-3'>
            <form className='grid gap-4' onSubmit={handleSubmit}>
              <div className='grid gap-1'>
                <label htmlFor='name' className='font-medium'>Product Name *</label>
                <input
                  id='name'
                  type='text'
                  placeholder='e.g., Airtel ₹299 Plan'
                  name='name'
                  value={data.name}
                  onChange={handleChange}
                  required
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
              </div>

              <div className='grid gap-1'>
                <label htmlFor='type' className='font-medium'>Type *</label>
                <select
                  id='type'
                  name='type'
                  value={data.type}
                  onChange={handleChange}
                  required
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                >
                  <option value='mobile_recharge'>Mobile Recharge</option>
                  <option value='bill_payment'>Bill Payment</option>
                  <option value='ai_tool'>AI Tool</option>
                  <option value='streaming'>Streaming</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='provider' className='font-medium'>Provider</label>
                <input
                  id='provider'
                  type='text'
                  placeholder='e.g., Airtel, Netflix, ChatGPT'
                  name='provider'
                  value={data.provider}
                  onChange={handleChange}
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
              </div>

              <div className='grid gap-1'>
                <label htmlFor='description' className='font-medium'>Description *</label>
                <textarea
                  id='description'
                  placeholder='Enter product description'
                  name='description'
                  value={data.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
                />
              </div>

              <div>
                <p className='font-medium mb-2'>Image</p>
                <div>
                  <label htmlFor='productImage' className='bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer'>
                    <div className='text-center flex justify-center items-center flex-col'>
                      {imageLoading ? (
                        <ClipLoader size={30} color="#3b82f6" />
                      ) : (
                        <>
                          <FaCloudUploadAlt size={35} />
                          <p>Upload Image</p>
                        </>
                      )}
                    </div>
                    <input
                      type='file'
                      id='productImage'
                      className='hidden'
                      accept='image/*'
                      onChange={handleUploadImage}
                    />
                  </label>
                  <div className='flex flex-wrap gap-4 mt-2'>
                    {data.image.map((img, index) => {
                      return (
                        <div key={img + index} className='h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group'>
                          <img
                            src={img}
                            alt={img}
                            className='w-full h-full object-scale-down cursor-pointer'
                            onClick={() => setViewImageURL(img)}
                          />
                          <div onClick={() => handleDeleteImage(index)} className='absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-700 rounded text-white hidden group-hover:block cursor-pointer'>
                            <MdDelete />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className='grid gap-1'>
                <label className='font-medium'>Category</label>
                <div>
                  <select
                    className='bg-blue-50 border w-full p-2 rounded'
                    value={selectCategory}
                    onChange={(e) => {
                      const value = e.target.value
                      const category = allCategory.find(el => el._id === value)
                      if (category) {
                        setData((preve) => ({
                          ...preve,
                          category: [...preve.category, category],
                        }))
                      }
                      setSelectCategory("")
                    }}
                  >
                    <option value={""}>Select Category</option>
                    {allCategory.map((c, index) => {
                      return (
                        <option key={index} value={c?._id}>{c.name}</option>
                      )
                    })}
                  </select>
                  <div className='flex flex-wrap gap-3 mt-2'>
                    {data.category.map((c, index) => {
                      return (
                        <div key={c._id + index} className='text-sm flex items-center gap-1 bg-blue-50 px-2 py-1 rounded'>
                          <p>{c.name}</p>
                          <div className='hover:text-red-500 cursor-pointer' onClick={() => handleRemoveCategory(index)}>
                            <IoClose size={20} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className='grid gap-1'>
                <label className='font-medium'>Sub Category</label>
                <div>
                  <select
                    className='bg-blue-50 border w-full p-2 rounded'
                    value={selectSubCategory}
                    onChange={(e) => {
                      const value = e.target.value
                      const subCategory = allSubCategory.find(el => el._id === value)
                      if (subCategory) {
                        setData((preve) => ({
                          ...preve,
                          subCategory: [...preve.subCategory, subCategory]
                        }))
                      }
                      setSelectSubCategory("")
                    }}
                  >
                    <option value={""}>Select Sub Category</option>
                    {allSubCategory.map((c, index) => {
                      return (
                        <option key={index} value={c?._id}>{c.name}</option>
                      )
                    })}
                  </select>
                  <div className='flex flex-wrap gap-3 mt-2'>
                    {data.subCategory.map((c, index) => {
                      return (
                        <div key={c._id + index} className='text-sm flex items-center gap-1 bg-blue-50 px-2 py-1 rounded'>
                          <p>{c.name}</p>
                          <div className='hover:text-red-500 cursor-pointer' onClick={() => handleRemoveSubCategory(index)}>
                            <IoClose size={20} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-1'>
                  <label htmlFor='denomination' className='font-medium'>Denomination (₹)</label>
                  <input
                    id='denomination'
                    type='number'
                    placeholder='e.g., 299'
                    name='denomination'
                    value={data.denomination}
                    onChange={handleChange}
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>

                <div className='grid gap-1'>
                  <label htmlFor='price' className='font-medium'>Price (₹) *</label>
                  <input
                    id='price'
                    type='number'
                    placeholder='Enter price'
                    name='price'
                    value={data.price}
                    onChange={handleChange}
                    required
                    className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                </div>
              </div>

              <div className='grid gap-1'>
                <label htmlFor='discount' className='font-medium'>Discount (%)</label>
                <input
                  id='discount'
                  type='number'
                  placeholder='Enter discount percentage'
                  name='discount'
                  value={data.discount}
                  onChange={handleChange}
                  min='0'
                  max='100'
                  className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                />
              </div>

              {data.type === "mobile_recharge" && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-1'>
                      <label htmlFor='details.validity' className='font-medium'>Validity</label>
                      <input
                        id='details.validity'
                        type='text'
                        placeholder='e.g., 28 days'
                        name='details.validity'
                        value={data.details.validity}
                        onChange={handleChange}
                        className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                      />
                    </div>
                    <div className='grid gap-1'>
                      <label htmlFor='details.data' className='font-medium'>Data</label>
                      <input
                        id='details.data'
                        type='text'
                        placeholder='e.g., 2GB/day'
                        name='details.data'
                        value={data.details.data}
                        onChange={handleChange}
                        className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='grid gap-1'>
                      <label htmlFor='details.operator' className='font-medium'>Operator</label>
                      <input
                        id='details.operator'
                        type='text'
                        placeholder='e.g., Airtel, Jio, Vi'
                        name='details.operator'
                        value={data.details.operator}
                        onChange={handleChange}
                        className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                      />
                    </div>
                    <div className='grid gap-1'>
                      <label htmlFor='details.circle' className='font-medium'>Circle</label>
                      <input
                        id='details.circle'
                        type='text'
                        placeholder='e.g., Delhi, Mumbai'
                        name='details.circle'
                        value={data.details.circle}
                        onChange={handleChange}
                        className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                      />
                    </div>
                  </div>
                </>
              )}

              <div className='grid gap-1'>
                <label className='font-medium'>Benefits</label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Add benefit'
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddBenefit()
                      }
                    }}
                    className='flex-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                  <button
                    type='button'
                    onClick={handleAddBenefit}
                    className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                  >
                    Add
                  </button>
                </div>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {data.details.benefits?.map((benefit, index) => (
                    <div key={index} className='text-sm flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded'>
                      <span>{benefit}</span>
                      <button
                        type='button'
                        onClick={() => handleRemoveBenefit(index)}
                        className='hover:text-red-600'
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className='grid gap-1'>
                <label className='font-medium'>Tags</label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Add tag'
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    className='flex-1 bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                  />
                  <button
                    type='button'
                    onClick={handleAddTag}
                    className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                  >
                    Add
                  </button>
                </div>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {data.tags?.map((tag, index) => (
                    <div key={index} className='text-sm flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded'>
                      <span>#{tag}</span>
                      <button
                        type='button'
                        onClick={() => handleRemoveTag(index)}
                        className='hover:text-red-600'
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    name='publish'
                    checked={data.publish}
                    onChange={handleChange}
                    className='w-4 h-4'
                  />
                  <span className='font-medium'>Publish</span>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    name='isPopular'
                    checked={data.isPopular}
                    onChange={handleChange}
                    className='w-4 h-4'
                  />
                  <span className='font-medium'>Popular</span>
                </label>
                <label className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    name='isFeatured'
                    checked={data.isFeatured}
                    onChange={handleChange}
                    className='w-4 h-4'
                  />
                  <span className='font-medium'>Featured</span>
                </label>
              </div>

              <button
                type='submit'
                className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'
              >
                Update Product
              </button>
            </form>
          </div>

          {ViewImageURL && (
            <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
          )}
        </section>
      </div>
    </section>
  )
}

export default EditRechargeProductAdmin

