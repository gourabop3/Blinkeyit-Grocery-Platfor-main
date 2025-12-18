import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { FiCreditCard, FiLoader, FiUser, FiMail, FiPhone } from 'react-icons/fi'
import { useForm } from 'react-hook-form'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const handleOnlinePayment = async (formData) => {
    try {
        // Check if cart has items
        if (!cartItemsList || cartItemsList.length === 0) {
          toast.error("Your cart is empty")
          return
        }

        setIsProcessingPayment(true)
        
        // Check if Stripe public key is available
        const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
        if (!stripePublicKey) {
          toast.error("Payment system is not configured. Please contact support.")
          console.error("VITE_STRIPE_PUBLIC_KEY is not set in environment variables")
          return
        }

        toast.loading("Initializing payment...")
        
        const stripePromise = await loadStripe(stripePublicKey)
        
        if (!stripePromise) {
          toast.error("Failed to initialize payment system")
          return
        }
       
        const response = await Axios({
            ...SummaryApi.payment_url,
            data : {
              list_items : cartItemsList,
              customerName: formData.name,
              customerEmail: formData.email,
              customerPhone: formData.phone,
              subTotalAmt : notDiscountTotalPrice,
              totalAmt : totalPrice,
            }
        })

        const { data : responseData } = response

        if (responseData && responseData.id) {
          toast.dismiss() // Remove loading toast
          toast.success("Redirecting to payment...")
          
          // Store cart clearing flag in sessionStorage for Success page
          sessionStorage.setItem('pendingCartClear', 'true');
          
          const result = await stripePromise.redirectToCheckout({ 
            sessionId: responseData.id 
          })
          
          if (result.error) {
            toast.error(result.error.message)
            // Remove the flag if redirect failed
            sessionStorage.removeItem('pendingCartClear');
          }
        } else {
          toast.error("Failed to create payment session")
        }
        
        // Note: Do NOT clear cart here - only clear after successful payment
        // Cart will be cleared on Success page after confirmed payment
        
    } catch (error) {
        toast.dismiss() // Remove any loading toasts
        console.error("Payment Error:", error)
        AxiosToastError(error)
        // Remove the flag if payment failed
        sessionStorage.removeItem('pendingCartClear');
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <section className='bg-gray-50 min-h-screen py-8'>
      <div className='container mx-auto px-4 flex flex-col lg:flex-row w-full gap-6 justify-between max-w-6xl'>
        <div className='w-full lg:w-2/3'>
          {/***Customer Information Form***/}
          <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
            <h3 className='text-2xl font-bold text-gray-900 mb-6'>Contact Information</h3>
            <form onSubmit={handleSubmit((data) => {})} className='space-y-5'>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className='block text-sm font-medium text-gray-700 mb-2'>
                  <FiUser className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { 
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className='block text-sm font-medium text-gray-700 mb-2'>
                  <FiMail className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className='block text-sm font-medium text-gray-700 mb-2'>
                  <FiPhone className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.phone 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="1234567890"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className='w-full lg:w-1/3 bg-white py-6 px-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-4'>
          {/**summary**/}
          <h3 className='text-xl font-bold text-gray-900 mb-6'>Order Summary</h3>
          <div className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <p className="text-gray-600">Items ({totalQty})</p>
                <p className='flex items-center gap-2'>
                  <span className='line-through text-gray-400 text-sm'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                  <span className="font-semibold text-gray-900">{DisplayPriceInRupees(totalPrice)}</span>
                </p>
              </div>
              <div className='flex justify-between items-center'>
                <p className="text-gray-600">Delivery</p>
                <p className='text-green-600 font-medium'>Free</p>
              </div>
              <hr className="my-4 border-gray-200" />
              <div className='font-bold flex items-center justify-between text-xl pt-2'>
                <p className="text-gray-900">Total</p>
                <p className="text-blue-600">{DisplayPriceInRupees(totalPrice)}</p>
              </div>
            </div>
          </div>
          
          <div className='w-full flex flex-col gap-3 mt-8'>
            <button 
              type="button"
              className={`py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg w-full ${isProcessingPayment ? 'opacity-70' : ''}`} 
              onClick={handleSubmit(handleOnlinePayment)}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard className="w-5 h-5" />
                  Pay Online
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
