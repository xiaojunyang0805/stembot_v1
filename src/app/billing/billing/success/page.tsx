// src/app/(billing)/billing/success/page.tsx
/**
 * Payment success confirmation page
 * Shows successful subscription activation
 * Located at: src/app/(billing)/billing/success/page.tsx
 * URL: /billing/success
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Successful - StemBot',
  description: 'Your subscription has been activated successfully',
};

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Welcome to StemBot Hobby Plan
        </p>
        <p className="text-gray-500">
          Your subscription is now active and ready to use
        </p>
      </div>

      {/* Subscription Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold text-gray-900">StemBot Hobby</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">€18.15/month</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Trial Period:</span>
            <span className="font-semibold text-green-600">14 days free</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">First Charge:</span>
            <span className="font-semibold text-gray-900">January 15, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold text-gray-900">•••• •••• •••• 4242</span>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Included in Your Plan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-1">✓</span>
            <div>
              <div className="font-medium text-gray-900">1,000 AI Queries/Month</div>
              <div className="text-sm text-gray-600">10x more than free plan</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-1">✓</span>
            <div>
              <div className="font-medium text-gray-900">Advanced AI Models</div>
              <div className="text-sm text-gray-600">Better accuracy and reasoning</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-1">✓</span>
            <div>
              <div className="font-medium text-gray-900">Unlimited Projects</div>
              <div className="text-sm text-gray-600">Create as many as you need</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-1">✓</span>
            <div>
              <div className="font-medium text-gray-900">Collaboration Features</div>
              <div className="text-sm text-gray-600">Share and work together</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-1">✓</span>
            <div>
              <div className="font-medium text-gray-900">Advanced Analytics</div>
              <div className="text-sm text-gray-600">Detailed progress insights</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-green-500 mr-3 mt-1">✓</span>
            <div>
              <div className="font-medium text-gray-900">Priority Support</div>
              <div className="text-sm text-gray-600">Faster response times</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Get Started</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 text-sm font-semibold">
              1
            </div>
            <div>
              <div className="font-medium text-blue-900">Create Your First Project</div>
              <div className="text-sm text-blue-700">Upload materials and start learning</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 text-sm font-semibold">
              2
            </div>
            <div>
              <div className="font-medium text-blue-900">Explore Advanced Features</div>
              <div className="text-sm text-blue-700">Try collaboration and analytics</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4 text-sm font-semibold">
              3
            </div>
            <div>
              <div className="font-medium text-blue-900">Track Your Progress</div>
              <div className="text-sm text-blue-700">Monitor learning and earn badges</div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-yellow-50 rounded-xl p-6 mb-8">
        <div className="flex items-start">
          <span className="text-yellow-600 mr-3 mt-1">⚠</span>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Important Reminders</h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• Your free trial ends on January 15, 2025</li>
              <li>• You can cancel anytime before the trial ends</li>
              <li>• Manage your subscription in the billing dashboard</li>
              <li>• All your data remains private and processed locally</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard/dashboard"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-center transition-colors"
        >
          Go to Dashboard
        </Link>
        
        <Link
          href="/dashboard/projects/create"
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold text-center transition-colors"
        >
          Create First Project
        </Link>
        
        <Link
          href="/billing/billing"
          className="bg-white text-gray-700 px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 font-semibold text-center transition-colors"
        >
          View Billing
        </Link>
      </div>

      {/* Support Information */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-2">Need help getting started?</p>
        <div className="flex justify-center space-x-6 text-sm">
          <Link href="/help" className="text-blue-600 hover:underline">
            Help Center
          </Link>
          <Link href="mailto:support@stembot.nl" className="text-blue-600 hover:underline">
            Contact Support
          </Link>
          <Link href="/docs" className="text-blue-600 hover:underline">
            Documentation
          </Link>
        </div>
      </div>

      {/* Confirmation Email Notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>A confirmation email has been sent to your inbox with your receipt and subscription details.</p>
      </div>
    </div>
  );
}