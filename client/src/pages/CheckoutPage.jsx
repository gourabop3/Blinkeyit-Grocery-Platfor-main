import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { FiCreditCard, FiTruck, FiLoader } from 'react-icons/fi'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem,fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isProcessingCOD, setIsProcessingCOD] = useState(false)

  const handleCashOnDelivery = async() => {
      try {
          setIsProcessingCOD(true)
          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : notDiscountTotalPrice,
              totalAmt : totalPrice,
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      } finally {
        setIsProcessingCOD(false)
      }
  }

  const handleOnlinePayment = async()=>{
    try {
        // Check if address is selected
        if (!addressList[selectAddress]?._id) {
          toast.error("Please select a delivery address")
          return
        }

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
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : notDiscountTotalPrice,
              totalAmt : totalPrice,
            }
        })

        const { data : responseData } = response

        if (responseData && responseData.id) {
          toast.dismiss() // Remove loading toast
          toast.success("Redirecting to payment...")
          
          const result = await stripePromise.redirectToCheckout({ 
            sessionId: responseData.id 
          })
          
          if (result.error) {
            toast.error(result.error.message)
          }
        } else {
          toast.error("Failed to create payment session")
        }
        
        if(fetchCartItem){
          fetchCartItem()
        }
        if(fetchOrder){
          fetchOrder()
        }
    } catch (error) {
        toast.dismiss() // Remove any loading toasts
        console.error("Payment Error:", error)
        AxiosToastError(error)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <section className='bg-blue-50 min-h-screen'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          {/***address***/}
          <h3 className='text-lg font-semibold mb-4'>Choose your address</h3>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            {
              addressList.map((address, index) => {
                return (
                  <label key={index} htmlFor={"address" + index} className={!address.status ? "hidden" : "block mb-3"}>
                    <div className={`border rounded-lg p-4 flex gap-3 hover:bg-blue-50 cursor-pointer transition-colors ${selectAddress == index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <div className="mt-1">
                        <input 
                          id={"address" + index} 
                          type='radio' 
                          value={index} 
                          onChange={(e) => setSelectAddress(e.target.value)} 
                          name='address'
                          checked={selectAddress == index}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{address.address_line}</p>
                        <p className="text-gray-600">{address.city}</p>
                        <p className="text-gray-600">{address.state}</p>
                        <p className="text-gray-600">{address.country} - {address.pincode}</p>
                        <p className="text-gray-600">{address.mobile}</p>
                      </div>
                    </div>
                  </label>
                )
              })
            }
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg flex justify-center items-center cursor-pointer hover:bg-blue-100 transition-colors'>
              <span className="text-blue-600 font-medium">+ Add address</span>
            </div>
          </div>
        </div>

        <div className='w-full max-w-md bg-white py-6 px-4 rounded-lg shadow-sm h-fit'>
          {/**summary**/}
          <h3 className='text-lg font-semibold mb-4'>Order Summary</h3>
          <div className='space-y-4'>
            <h4 className='font-semibold text-gray-900'>Bill details</h4>
            <div className='space-y-2'>
              <div className='flex gap-4 justify-between'>
                <p className="text-gray-600">Items total</p>
                <p className='flex items-center gap-2'>
                  <span className='line-through text-gray-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                  <span className="font-medium">{DisplayPriceInRupees(totalPrice)}</span>
                </p>
              </div>
              <div className='flex gap-4 justify-between'>
                <p className="text-gray-600">Quantity total</p>
                <p className='flex items-center gap-2'>{totalQty} item{totalQty > 1 ? 's' : ''}</p>
              </div>
              <div className='flex gap-4 justify-between'>
                <p className="text-gray-600">Delivery Charge</p>
                <p className='flex items-center gap-2 text-green-600 font-medium'>Free</p>
              </div>
              <hr className="my-3" />
              <div className='font-semibold flex items-center justify-between gap-4 text-lg'>
                <p>Grand total</p>
                <p className="text-blue-600">{DisplayPriceInRupees(totalPrice)}</p>
              </div>
            </div>
          </div>
          
          <div className='w-full flex flex-col gap-4 mt-6'>
            <button 
              className={`py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2 ${isProcessingPayment ? 'opacity-70' : ''}`} 
              onClick={handleOnlinePayment}
              disabled={isProcessingPayment || isProcessingCOD}
            >
              {isProcessingPayment ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCreditCard className="w-5 h-5" />
                  Online Payment
                </>
              )}
            </button>

            <button 
              className={`py-3 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white disabled:border-green-400 disabled:text-green-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 ${isProcessingCOD ? 'opacity-70' : ''}`} 
              onClick={handleCashOnDelivery}
              disabled={isProcessingPayment || isProcessingCOD}
            >
              {isProcessingCOD ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiTruck className="w-5 h-5" />
                  Cash on Delivery
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }
    </section>
  )
}

export default CheckoutPage
