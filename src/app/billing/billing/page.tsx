// src/app/(billing)/billing/page.tsx
/**
 * Billing dashboard page
 * Shows current subscription, usage, and billing history
 * Located at: src/app/(billing)/billing/page.tsx
 * URL: /billing
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Billing - StemBot',
  description: 'Manage your subscription and billing',
};

export default function BillingPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your plan and view usage statistics</p>
        </div>
        <Link 
          href="/billing/pricing"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Change Plan
        </Link>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">StemBot Hobby</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">€15.00</p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Next Billing Date</h3>
            <p className="text-lg text-gray-900 mb-1">January 15, 2025</p>
            <p className="text-sm text-gray-600">Auto-renewal enabled</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
            <div className="flex items-center">
              <span className="mr-2">💳</span>
              <span className="text-gray-900">•••• •••• •••• 4242</span>
            </div>
            <button className="text-sm text-blue-600 hover:underline mt-1">
              Update payment method
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mt-6 pt-6 border-t">
          <button className="text-blue-600 hover:underline text-sm">
            Cancel subscription
          </button>
          <button className="text-blue-600 hover:underline text-sm">
            Download invoice
          </button>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage This Month</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">AI Queries</h3>
              <span className="text-sm text-gray-600">347 of 1,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-blue-600 h-3 rounded-full" style={{width: '34.7%'}}></div>
            </div>
            <p className="text-sm text-gray-600">653 queries remaining</p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Projects Created</h3>
              <span className="text-sm text-gray-600">12 of unlimited</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-green-600 h-3 rounded-full" style={{width: '100%'}}></div>
            </div>
            <p className="text-sm text-gray-600">No limit on your plan</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">📊</span>
            <div>
              <h4 className="font-semibold text-green-800">Usage Insights</h4>
              <p className="text-sm text-green-700">
                You're using 35% of your monthly quota. At this rate, you'll use about 700 queries this month.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
          <button className="text-blue-600 hover:underline text-sm">
            Download all invoices
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">Dec 15, 2024</td>
                <td className="py-3 px-4 text-gray-600">StemBot Hobby - Monthly</td>
                <td className="py-3 px-4 text-gray-900">€18.15</td>
                <td className="py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Paid
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:underline text-sm">Download</button>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">Nov 15, 2024</td>
                <td className="py-3 px-4 text-gray-600">StemBot Hobby - Monthly</td>
                <td className="py-3 px-4 text-gray-900">€18.15</td>
                <td className="py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Paid
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-blue-600 hover:underline text-sm">Download</button>
                </td>
              </tr>
              
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-900">Oct 15, 2024</td>
                <td className="py-3 px-4 text-gray-600">Free Trial Started</td>
                <td className="py-3 px-4 text-gray-900">€0.00</td>
                <td className="py-3 px-4">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                    Trial
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Actions</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Update Payment Method</h3>
              <p className="text-sm text-gray-600">Change your default payment method</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Update
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">Billing Address</h3>
              <p className="text-sm text-gray-600">Update your billing information</p>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              Edit
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-semibold text-red-900">Cancel Subscription</h3>
              <p className="text-sm text-red-700">Cancel your subscription and downgrade to free</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}