import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import toast from 'react-hot-toast'

const Success = () => {
  const location = useLocation()
  const { fetchCartItem, fetchOrder } = useGlobalContext()
    
  useEffect(() => {
    // Check if this is a return from Stripe payment
    const pendingCartClear = sessionStorage.getItem('pendingCartClear')
    const urlParams = new URLSearchParams(location.search)
    const isFromStripe = urlParams.get('session_id') || urlParams.get('payment_intent')
    
    // Clear cart if returning from Stripe payment OR if there's a pending cart clear flag
    if (pendingCartClear === 'true' || isFromStripe) {
      // Clear the cart after successful payment
      if (fetchCartItem) {
        fetchCartItem()
        console.log('Cart cleared after successful payment')
      }
      
      // Refresh orders to show the new order
      if (fetchOrder) {
        fetchOrder()
        console.log('Orders refreshed after successful payment')
      }
      
      // Remove the flag
      sessionStorage.removeItem('pendingCartClear')
      
      // Show success message only if not from COD
      if (isFromStripe) {
        toast.success('Payment completed successfully! Cart has been cleared.')
      } else if (pendingCartClear === 'true') {
        toast.success('Payment completed! Cart has been cleared.')
      }
    } else {
      // Fallback: Always refresh cart and orders on success page
      // This handles cases where user lands on success page directly
      setTimeout(() => {
        if (fetchCartItem) {
          fetchCartItem()
        }
        if (fetchOrder) {
          fetchOrder()
        }
      }, 1000) // Small delay to ensure page is fully loaded
    }
  }, [fetchCartItem, fetchOrder, location.search])
  
  console.log("location", location)  
  return (
    <div className='m-2 w-full max-w-md bg-green-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-green-800 font-bold text-lg text-center'>{Boolean(location?.state?.text) ? location?.state?.text : "Payment" } Successfully</p>
        <Link to="/" className="border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1">Go To Home</Link>
    </div>
  )
}

export default Success
