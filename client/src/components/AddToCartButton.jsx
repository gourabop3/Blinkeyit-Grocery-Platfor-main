import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from './Loading'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6"
import { useNavigate } from 'react-router-dom'
import { isUserAuthenticated, checkAuthToken } from '../utils/checkAuthToken'

const AddToCartButton = ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart)
    const user = useSelector(state => state.user)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails,setCartItemsDetails] = useState()
    const navigate = useNavigate()

    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Check authentication before adding to cart
        if (!isUserAuthenticated(user)) {
            toast.error("Please login to add items to cart")
            // Navigate to login page after a short delay
            setTimeout(() => {
                navigate('/login')
            }, 1500)
            return
        }

        // Additional check for token availability
        if (!checkAuthToken()) {
            toast.error("Session expired. Please login again")
            setTimeout(() => {
                navigate('/login')
            }, 1500)
            return
        }

        try {
            setLoading(true)

            const response = await Axios({
                ...SummaryApi.addTocart,
                data: {
                    productId: data?._id
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                if (fetchCartItem) {
                    fetchCartItem()
                }
            }
        } catch (error) {
            // Enhanced error handling for authentication issues
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again")
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else if (error.response?.data?.message === "Provide token") {
                toast.error("Authentication required. Please login")
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            } else {
                AxiosToastError(error)
            }
        } finally {
            setLoading(false)
        }

    }

    //checking this item in cart or not
    useEffect(() => {
        const checkingitem = cartItem.some(item => item.productId._id === data._id)
        setIsAvailableCart(checkingitem)

        const product = cartItem.find(item => item.productId._id === data._id)
        setQty(product?.quantity)
        setCartItemsDetails(product)
    }, [data, cartItem])


    const increaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()

        // Check authentication before updating cart
        if (!isUserAuthenticated(user)) {
            toast.error("Please login to update cart")
            setTimeout(() => {
                navigate('/login')
            }, 1500)
            return
        }
    
       try {
           const response = await updateCartItem(cartItemDetails?._id,qty+1)
           
           if(response.success){
            toast.success("Item added")
           }
       } catch (error) {
           if (error.response?.status === 401 || error.response?.data?.message === "Provide token") {
               toast.error("Session expired. Please login again")
               setTimeout(() => {
                   navigate('/login')
               }, 1500)
           }
       }
    }

    const decreaseQty = async(e) => {
        e.preventDefault()
        e.stopPropagation()

        // Check authentication before updating cart
        if (!isUserAuthenticated(user)) {
            toast.error("Please login to update cart")
            setTimeout(() => {
                navigate('/login')
            }, 1500)
            return
        }

        try {
            if(qty === 1){
                await deleteCartItem(cartItemDetails?._id)
            }else{
                const response = await updateCartItem(cartItemDetails?._id,qty-1)

                if(response.success){
                    toast.success("Item remove")
                }
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.data?.message === "Provide token") {
                toast.error("Session expired. Please login again")
                setTimeout(() => {
                    navigate('/login')
                }, 1500)
            }
        }
    }
    return (
        <div className='w-full max-w-[150px]'>
            {
                isAvailableCart ? (
                    <div className='flex w-full h-full'>
                        <button onClick={decreaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaMinus /></button>

                        <p className='flex-1 w-full font-semibold px-1 flex items-center justify-center'>{qty}</p>

                        <button onClick={increaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaPlus /></button>
                    </div>
                ) : (
                    <button onClick={handleADDTocart} className='bg-green-600 hover:bg-green-700 text-white px-2 lg:px-4 py-1 rounded'>
                        {loading ? <Loading /> : "Add"}
                    </button>
                )
            }

        </div>
    )
}

export default AddToCartButton
