import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'
import crypto from 'crypto'

// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Initialize Razorpay instance
let razorpayInstance = null
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpayInstance = new razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET,
        })
        console.log("Razorpay instance initialized successfully")
    } else {
        console.warn("Razorpay keys not found in environment variables")
    }
} catch (error) {
    console.error("Error initializing Razorpay instance:", error)
}

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        const { userId, items, amount, address} = req.body;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:  `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe 
const verifyStripe = async (req,res) => {

    const { orderId, success, userId } = req.body

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            res.json({success: true});
        } else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req,res) => {
    try {
        
        // Check if Razorpay keys are configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay keys not configured in environment variables")
            return res.json({success:false,message:"Razorpay configuration error. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env file"})
        }

        // Check if Razorpay instance is initialized
        if (!razorpayInstance) {
            console.error("Razorpay instance not initialized")
            return res.json({success:false,message:"Razorpay instance not initialized. Please check your backend configuration."})
        }

        const { userId, items, amount, address} = req.body

        console.log("Creating Razorpay order:", { userId, amount })

        if (!userId || !items || !amount) {
            return res.json({success:false,message:"Missing required fields"})
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const options = {
            amount: Math.round(amount * 100), // Ensure amount is in paise and is an integer
            currency: currency.toUpperCase(),
            receipt : newOrder._id.toString()
        }

        console.log("Razorpay order options:", options)

        const order = await razorpayInstance.orders.create(options)
        console.log("Razorpay order created:", order.id)
        
        res.json({success:true,order})

    } catch (error) {
        console.error("Error creating Razorpay order:", error)
        
        // Provide more specific error messages
        let errorMessage = "Failed to create payment order"
        
        if (error.error) {
            // Razorpay API error
            if (error.error.description) {
                errorMessage = error.error.description
            } else if (error.error.reason) {
                errorMessage = error.error.reason
            } else if (error.error.message) {
                errorMessage = error.error.message
            }
        } else if (error.message) {
            errorMessage = error.message
        }
        
        // Check for specific error types
        if (error.statusCode === 401 || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            errorMessage = "Invalid Razorpay credentials. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env file"
        } else if (error.statusCode === 400 || errorMessage.includes('400')) {
            errorMessage = `Invalid request to Razorpay: ${errorMessage}`
        }
        
        res.json({success:false,message:errorMessage})
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        console.log("Verifying Razorpay payment:", { userId, razorpay_order_id, razorpay_payment_id })

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error("Missing payment details")
            return res.json({ success: false, message: 'Missing payment details' })
        }

        // Verify the payment signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex')

        console.log("Signature verification:", { generated: generated_signature, received: razorpay_signature })

        if (generated_signature !== razorpay_signature) {
            console.error("Signature mismatch")
            return res.json({ success: false, message: 'Payment verification failed - Invalid signature' })
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        console.log("Order info from Razorpay:", orderInfo)

        if (orderInfo.status === 'paid') {
            await orderModel.findByIdAndUpdate(orderInfo.receipt,{payment:true});
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
            console.log("Payment verified successfully")
            res.json({ success: true, message: "Payment Successful" })
        } else {
            console.error("Order status is not paid:", orderInfo.status)
            res.json({ success: false, message: `Payment Failed - Order status: ${orderInfo.status}` });
        }

    } catch (error) {
        console.error("Error in verifyRazorpay:", error)
        res.json({success:false,message:error.message || "Payment verification failed"})
    }
}


// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        const orders = await orderModel.find({})
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// delete order from Admin Panel
const deleteOrder = async (req,res) => {
    try {
        
        const { orderId } = req.body

        await orderModel.findByIdAndDelete(orderId)
        res.json({success:true,message:'Order Deleted'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// get sales analytics by product
const getSalesAnalytics = async (req,res) => {
    try {
        
        const orders = await orderModel.find({})
        
        // Calculate sales by product
        const productSales = {}
        
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productId = item._id || item.id
                    const productName = item.name || 'Unknown Product'
                    
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            productId: productId,
                            productName: productName,
                            image: item.image ? (Array.isArray(item.image) ? item.image[0] : item.image) : null,
                            totalQuantity: 0,
                            totalRevenue: 0,
                            orderCount: 0
                        }
                    }
                    
                    productSales[productId].totalQuantity += item.quantity || 0
                    productSales[productId].totalRevenue += (item.price || 0) * (item.quantity || 0)
                    productSales[productId].orderCount += 1
                })
            }
        })
        
        // Convert to array and sort by revenue
        const salesArray = Object.values(productSales).sort((a, b) => b.totalRevenue - a.totalRevenue)
        
        // Calculate total sales
        const totalSales = orders.reduce((sum, order) => sum + (order.amount || 0), 0)
        const totalOrders = orders.length
        
        res.json({
            success: true,
            productSales: salesArray,
            totalSales,
            totalOrders
        })

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, deleteOrder, getSalesAnalytics}