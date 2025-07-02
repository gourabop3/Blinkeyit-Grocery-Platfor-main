import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const Cancel = () => {
  useEffect(() => {
    // Remove pending cart clear flag if user cancelled payment
    const pendingCartClear = sessionStorage.getItem('pendingCartClear')
    if (pendingCartClear === 'true') {
      sessionStorage.removeItem('pendingCartClear')
      toast.error('Payment was cancelled. Your cart items are still saved.')
      console.log('Payment cancelled - cart clear flag removed')
    }
  }, [])

  return (
    <div className='m-2 w-full max-w-md bg-red-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5'>
        <p className='text-red-800 font-bold text-lg text-center'>Payment Cancelled</p>
        <p className='text-red-700 text-sm text-center'>Your cart items are still saved. You can try again anytime.</p>
        <div className='flex gap-3'>
          <Link to="/checkout" className="border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all px-4 py-1">Try Again</Link>
          <Link to="/" className="border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all px-4 py-1">Go To Home</Link>
        </div>
    </div>
  )
}

export default Cancel
