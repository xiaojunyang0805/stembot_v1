// src/app/(billing)/checkout/page.tsx
/**
 * Stripe checkout page
 * Handles subscription setup and payment processing
 * Located at: src/app/(billing)/checkout/page.tsx
 * URL: /checkout
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Checkout - StemBot',
  description: 'Complete your subscription setup',
};

export default function CheckoutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">StemBot Hobby Plan</h3>
                <p className="text-sm text-gray-600">1,000 AI queries per month</p>
                <p className="text-sm text-gray-600">Advanced AI models & collaboration</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">€15.00</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>€15.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (21% VAT)</span>
                <span>€3.15</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 mt-2 pt-2 border-t">
                <span>Total</span>
                <span>€18.15</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-green-600 mr-2">🎉</span>
              <span className="font-semibold text-green-800">14-Day Free Trial</span>
            </div>
            <p className="text-sm text-green-700">
              You won't be charged until January 15, 2025. Cancel anytime during the trial.
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
          
          {/* TODO: Replace with actual Stripe Elements */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                {/* TODO: Replace with Stripe Card Element */}
                <div className="text-gray-500 text-center py-8">
                  Stripe Payment Form
                  <br />
                  <span className="text-sm">Secure card processing will be implemented here</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="terms" className="mr-2" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Start Free Trial
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Secure payment processing by Stripe</p>
            <div className="flex justify-center items-center mt-2 space-x-4">
              <span>🔒 SSL Secured</span>
              <span>💳 All major cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">🔒</span>
          <h3 className="font-semibold text-gray-900">Your Privacy Remains Protected</h3>
        </div>
        <p className="text-gray-600">
          Even with a paid subscription, all your learning data stays local. We only process payment information securely through Stripe.
        </p>
      </div>
    </div>
  );
}