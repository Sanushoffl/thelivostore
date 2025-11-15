import React from 'react'
import Title from '../components/Title'

const Delivery = () => {
  return (
    <div className='min-h-[60vh] py-8'>
      <div className='text-2xl text-center pt-8 border-t mb-10'>
        <Title text1={'DELIVERY'} text2={'INFORMATION'} />
      </div>

      <div className='max-w-4xl mx-auto space-y-8 text-gray-700'>
        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Shipping Options</h2>
          <p className='mb-4'>
            We offer various shipping options to meet your needs. Standard delivery typically takes 5-7 business days, while express delivery is available for faster shipping within 2-3 business days.
          </p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Standard Delivery: 5-7 business days</li>
            <li>Express Delivery: 2-3 business days</li>
            <li>Same Day Delivery: Available in select areas</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Delivery Charges</h2>
          <p className='mb-4'>
            Delivery charges are calculated based on your location and the shipping method selected. Free delivery is available on orders above a certain amount.
          </p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Standard Delivery: $10.00</li>
            <li>Express Delivery: $20.00</li>
            <li>Free Delivery: On orders above $100</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Cash on Delivery</h2>
          <p className='mb-4'>
            We offer Cash on Delivery (COD) as a payment option for your convenience. You can pay in cash when your order is delivered to your doorstep.
          </p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Tracking Your Order</h2>
          <p className='mb-4'>
            Once your order is shipped, you will receive a tracking number via email and SMS. You can use this tracking number to monitor your order's progress in real-time.
          </p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Delivery Areas</h2>
          <p className='mb-4'>
            We currently deliver to all major cities and towns. If you're unsure about delivery to your area, please contact our customer service team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Delivery

