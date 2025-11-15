import React from 'react'
import Title from '../components/Title'

const PrivacyPolicy = () => {
  return (
    <div className='min-h-[60vh] py-8'>
      <div className='text-2xl text-center pt-8 border-t mb-10'>
        <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <div className='max-w-4xl mx-auto space-y-8 text-gray-700'>
        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Introduction</h2>
          <p className='mb-4'>
            At Forever, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Information We Collect</h2>
          <p className='mb-4'>We collect information that you provide directly to us, including:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Name, email address, and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through our payment partners)</li>
            <li>Order history and preferences</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>How We Use Your Information</h2>
          <p className='mb-4'>We use the information we collect to:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and our services</li>
            <li>Improve our website and customer experience</li>
            <li>Send you promotional materials (with your consent)</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Data Security</h2>
          <p className='mb-4'>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Cookies</h2>
          <p className='mb-4'>
            We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can choose to disable cookies through your browser settings, though this may affect site functionality.
          </p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Third-Party Services</h2>
          <p className='mb-4'>
            We may share your information with trusted third-party service providers who assist us in operating our website, conducting our business, or serving our users, as long as those parties agree to keep this information confidential.
          </p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Your Rights</h2>
          <p className='mb-4'>You have the right to:</p>
          <ul className='list-disc list-inside space-y-2 ml-4'>
            <li>Access and update your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Contact Us</h2>
          <p className='mb-4'>
            If you have any questions about this Privacy Policy, please contact us at contact@foreveryou.com or call us at +1-212-456-7890.
          </p>
        </div>

        <div className='text-sm text-gray-500 mt-8'>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy

