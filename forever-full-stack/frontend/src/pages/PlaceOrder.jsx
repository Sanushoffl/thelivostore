import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const initPay = (order) => {
        // Check if Razorpay is loaded
        if (!window.Razorpay) {
            toast.error("Razorpay SDK not loaded. Please refresh the page.")
            console.error("Razorpay SDK not available")
            return
        }

        // Check if Razorpay key is configured
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
        if (!razorpayKey || razorpayKey.trim() === '') {
            toast.error("Razorpay key not configured. Please check your environment variables.")
            console.error("VITE_RAZORPAY_KEY_ID is not set or is empty")
            return
        }

        // Validate key format (basic check)
        if (razorpayKey.length < 10) {
            toast.error("Invalid Razorpay key format. Please check your environment variables.")
            console.error("Razorpay key appears to be invalid (too short)")
            return
        }

        console.log("Initializing Razorpay with order:", order)
        console.log("Razorpay Key (first 10 chars):", razorpayKey.substring(0, 10) + "...")

        // Validate order data before proceeding
        if (!order || !order.id || !order.amount) {
            toast.error("Invalid order data. Please try again.")
            console.error("Invalid order:", order)
            return
        }

        const options = {
            key: razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name:'Order Payment',
            description:'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log("Payment success response:", response)
                try {
                    if (!response.razorpay_order_id || !response.razorpay_payment_id || !response.razorpay_signature) {
                        console.error("Invalid payment response:", response)
                        toast.error("Invalid payment response")
                        return
                    }
                    
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay',{
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    },{headers:{token}})
                    if (data.success) {
                        toast.success(data.message || "Payment Successful")
                        navigate('/orders')
                        setCartItems({})
                    } else {
                        toast.error(data.message || "Payment Failed")
                    }
                } catch (error) {
                    console.error("Payment verification error:", error)
                    toast.error(error.response?.data?.message || error.message || "Payment verification failed")
                }
            },
            modal: {
                ondismiss: function() {
                    console.log("Payment modal dismissed")
                    toast.info("Payment cancelled")
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`.trim() || 'Customer',
                email: formData.email || '',
                contact: formData.phone || ''
            }
        }
        
        try {
            const rzp = new window.Razorpay(options)
            
            // Set up error handlers BEFORE opening
            rzp.on('payment.failed', function (response) {
                console.error("Payment failed:", response.error)
                const errorMsg = response.error?.description || response.error?.reason || "Payment Failed"
                toast.error(errorMsg)
                // Prevent default alert
                return false
            })
            
            rzp.on('payment.authorized', function (response) {
                console.log("Payment authorized:", response)
            })
            
            // Handle Razorpay initialization errors
            rzp.on('error', function (error) {
                console.error("Razorpay error:", error)
                const errorMsg = error.error?.description || error.error?.reason || "Payment gateway error. Please check your Razorpay configuration."
                toast.error(errorMsg)
                // Prevent default alert
                return false
            })
            
            // Override window.alert temporarily to catch Razorpay alerts
            const originalAlert = window.alert
            let alertIntercepted = false
            
            window.alert = function(message) {
                alertIntercepted = true
                console.warn("Razorpay alert intercepted:", message)
                if (message && (message.includes("Payment Failed") || message.includes("Something went wrong"))) {
                    toast.error("Payment Failed: Invalid Razorpay Key ID. Please check your VITE_RAZORPAY_KEY_ID in .env file and restart the server.")
                    return
                }
                // For other alerts, use toast instead
                toast.error(message || "An error occurred")
            }
            
            // Try to open Razorpay
            try {
                rzp.open()
            } catch (openError) {
                console.error("Error opening Razorpay:", openError)
                toast.error("Failed to open payment gateway. Please check your Razorpay configuration.")
            }
            
            // Restore original alert after a delay
            setTimeout(() => {
                if (!alertIntercepted) {
                    window.alert = originalAlert
                }
            }, 2000)
            
        } catch (error) {
            console.error("Error initializing Razorpay:", error)
            const errorMsg = error.message || "Failed to initialize payment gateway"
            if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
                toast.error("Invalid Razorpay Key ID. Please check your VITE_RAZORPAY_KEY_ID in .env file and restart the server.")
            } else {
                toast.error(errorMsg)
            }
        }
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                    if (responseStripe.data.success) {
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':
                    try {
                        const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                        console.log("Razorpay order response:", responseRazorpay.data)
                        if (responseRazorpay.data.success && responseRazorpay.data.order) {
                            if (!responseRazorpay.data.order.id || !responseRazorpay.data.order.amount) {
                                toast.error("Invalid order data received")
                                console.error("Invalid order:", responseRazorpay.data.order)
                                return
                            }
                            initPay(responseRazorpay.data.order)
                        } else {
                            toast.error(responseRazorpay.data.message || "Failed to initialize payment")
                        }
                    } catch (error) {
                        console.error("Razorpay initialization error:", error)
                        toast.error(error.response?.data?.message || error.message || "Failed to initialize payment")
                    }
                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                    <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                    <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
