import React, { useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { useDispatch } from 'react-redux'
import { handleAddItemCart } from '../store/cartProduct'
import toast from 'react-hot-toast'

const Success = () => {
  const location = useLocation()
  const { fetchCartItem, fetchOrder } = useGlobalContext()
  const dispatch = useDispatch()
  const [isProcessing, setIsProcessing] = useState(true)
  const hasProcessed = useRef(false) // Flag to prevent multiple executions
  const hasShownToast = useRef(false) // Flag to prevent multiple toasts
    
  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleSuccessPayment = async () => {
      // Clear any existing toasts first
      toast.dismiss()
      
      console.log("Success page loaded, URL params:", location.search)
      
      // Check if this is a return from Stripe payment
      const urlParams = new URLSearchParams(location.search)
      const sessionId = urlParams.get('session_id')
      const paymentIntent = urlParams.get('payment_intent')
      const pendingCartClear = sessionStorage.getItem('pendingCartClear')
      
      console.log("Session ID:", sessionId)
      console.log("Payment Intent:", paymentIntent)
      console.log("Pending Cart Clear:", pendingCartClear)
      
      const isFromStripe = sessionId || paymentIntent
      
      if (isFromStripe || pendingCartClear === 'true') {
        console.log("Processing successful payment...")
        
        // Show success message immediately (only once)
        if (!hasShownToast.current) {
          toast.success('Payment completed successfully! Your order has been placed.')
          hasShownToast.current = true
        }
        
        // Add a delay to ensure webhook has been processed
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        try {
          // Force clear cart in Redux store immediately
          dispatch(handleAddItemCart([]))
          
          // Fetch updated cart from server
          if (fetchCartItem) {
            await fetchCartItem()
            console.log('Cart refreshed after successful payment')
          }
          
          // Fetch updated orders
          if (fetchOrder) {
            await fetchOrder()
            console.log('Orders refreshed after successful payment')
          }
          
          // Remove the pending flag
          sessionStorage.removeItem('pendingCartClear')
          
        } catch (error) {
          console.error("Error refreshing data:", error)
          if (!hasShownToast.current) {
            toast.error('Payment successful, but there was an issue refreshing data. Please check your orders.')
            hasShownToast.current = true
          }
        }
      } else {
        // Not from payment, just refresh data
        console.log("Not from payment, refreshing data...")
        try {
          if (fetchCartItem) {
            await fetchCartItem()
          }
          if (fetchOrder) {
            await fetchOrder()
          }
        } catch (error) {
          console.error("Error refreshing data:", error)
        }
      }
      
      setIsProcessing(false)
    }

    handleSuccessPayment()
  }, []) // Empty dependency array to run only once
  
  console.log("Success page location:", location)  
  
  return (
    <div className='m-2 w-full max-w-md bg-green-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
      {isProcessing ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
          <p className='text-green-800 font-medium'>Processing your order...</p>
        </div>
      ) : (
        <>
          <p className='text-green-800 font-bold text-lg text-center'>
            {Boolean(location?.state?.text) ? location?.state?.text : "Payment" } Successfully
          </p>
          <p className='text-green-700 text-center'>Your order has been placed and you will receive a confirmation shortly.</p>
        </>
      )}
      <Link to="/" className="border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1">
        Go To Home
      </Link>
      <Link to="/user/order" className="bg-green-800 text-white hover:bg-green-700 transition-all px-4 py-1 rounded">
        View My Orders
      </Link>
    </div>
  )
}

export default Success
