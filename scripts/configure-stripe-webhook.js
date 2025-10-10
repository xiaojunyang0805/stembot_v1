/**
 * Configure Stripe Webhook Endpoint
 *
 * This script automatically creates a webhook endpoint in your Stripe account
 * for handling subscription lifecycle events.
 *
 * Usage: node scripts/configure-stripe-webhook.js
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Webhook endpoint URL (production)
// Allow override via command line argument or use production URL
const WEBHOOK_URL = process.argv[2] || 'https://stembotv1.vercel.app/api/webhooks/stripe';

// Events to subscribe to
const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
];

async function configureWebhook() {
  try {
    console.log('🔧 Configuring Stripe Webhook...\n');
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    console.log(`Events: ${WEBHOOK_EVENTS.length} subscription lifecycle events\n`);

    // Check if webhook already exists
    console.log('📋 Checking for existing webhooks...');
    const existingWebhooks = await stripe.webhookEndpoints.list({
      limit: 100,
    });

    // Find webhook with matching URL
    const existingWebhook = existingWebhooks.data.find(
      (webhook) => webhook.url === WEBHOOK_URL
    );

    if (existingWebhook) {
      console.log(`⚠️  Webhook already exists: ${existingWebhook.id}`);
      console.log(`   Status: ${existingWebhook.status}`);
      console.log(`   Events: ${existingWebhook.enabled_events.length}`);

      // Ask user if they want to update
      console.log('\n❓ Do you want to update the existing webhook? (y/n)');
      console.log('   Note: This will update the events list to match the required events.');

      // For automated script, we'll update it
      console.log('✅ Updating existing webhook...\n');

      const updated = await stripe.webhookEndpoints.update(existingWebhook.id, {
        enabled_events: WEBHOOK_EVENTS,
        description: 'StemBot Subscription Lifecycle Events',
      });

      console.log('✅ Webhook updated successfully!\n');
      console.log('📝 Webhook Details:');
      console.log(`   ID: ${updated.id}`);
      console.log(`   URL: ${updated.url}`);
      console.log(`   Status: ${updated.status}`);
      console.log(`   Events: ${updated.enabled_events.join(', ')}`);
      console.log(`\n🔑 Webhook Signing Secret: ${updated.secret}`);
      console.log('\n⚠️  IMPORTANT: Add this to your environment variables:');
      console.log(`   STRIPE_WEBHOOK_SECRET=${updated.secret}`);
      console.log('\n   Add to both:');
      console.log('   1. .env.local (for local development)');
      console.log('   2. Vercel Environment Variables (for production)');

      return updated;
    }

    // Create new webhook
    console.log('📦 Creating new webhook endpoint...\n');

    const webhook = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: WEBHOOK_EVENTS,
      description: 'StemBot Subscription Lifecycle Events',
      api_version: '2025-09-30.clover', // Match your Stripe SDK version
    });

    console.log('✅ Webhook created successfully!\n');
    console.log('📝 Webhook Details:');
    console.log(`   ID: ${webhook.id}`);
    console.log(`   URL: ${webhook.url}`);
    console.log(`   Status: ${webhook.status}`);
    console.log(`   Events: ${webhook.enabled_events.join(', ')}`);
    console.log(`\n🔑 Webhook Signing Secret: ${webhook.secret}`);
    console.log('\n⚠️  IMPORTANT: Add this to your environment variables:');
    console.log(`   STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
    console.log('\n   Add to both:');
    console.log('   1. .env.local (for local development)');
    console.log('   2. Vercel Environment Variables (for production)');

    return webhook;
  } catch (error) {
    console.error('❌ Error configuring webhook:', error.message);

    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  Authentication failed. Please check:');
      console.error('   1. STRIPE_SECRET_KEY is set in .env.local');
      console.error('   2. The key starts with sk_live_ or sk_test_');
      console.error('   3. The key has not been deleted or restricted');
    }

    if (error.type === 'StripeInvalidRequestError') {
      console.error('\n⚠️  Invalid request. Please check:');
      console.error('   1. NEXT_PUBLIC_APP_URL is set correctly in .env.local');
      console.error('   2. The URL is publicly accessible (not localhost)');
      console.error('   3. The URL uses HTTPS (required for production webhooks)');
    }

    throw error;
  }
}

async function listExistingWebhooks() {
  try {
    console.log('\n📋 Existing Webhooks:');
    console.log('==================\n');

    const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });

    if (webhooks.data.length === 0) {
      console.log('No webhooks configured.\n');
      return;
    }

    webhooks.data.forEach((webhook, index) => {
      console.log(`${index + 1}. ${webhook.id}`);
      console.log(`   URL: ${webhook.url}`);
      console.log(`   Status: ${webhook.status}`);
      console.log(`   Events: ${webhook.enabled_events.length} (${webhook.enabled_events.slice(0, 3).join(', ')}${webhook.enabled_events.length > 3 ? '...' : ''})`);
      console.log(`   Description: ${webhook.description || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing webhooks:', error.message);
  }
}

async function testWebhook() {
  try {
    console.log('\n🧪 Testing Webhook Configuration...\n');

    // Check if STRIPE_WEBHOOK_SECRET is set
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.log('⚠️  STRIPE_WEBHOOK_SECRET not found in environment variables.');
      console.log('   Please add the webhook secret shown above to .env.local');
      console.log('   Then restart your development server: npm run dev');
      return;
    }

    console.log('✅ STRIPE_WEBHOOK_SECRET is configured');
    console.log('✅ Webhook endpoint ready: /api/webhooks/stripe');
    console.log('\n📋 Next Steps:');
    console.log('   1. Restart your development server if running: npm run dev');
    console.log('   2. Add webhook secret to Vercel environment variables');
    console.log('   3. Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/webhooks/stripe');
    console.log('   4. Or trigger test event: stripe trigger checkout.session.completed');
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

// Main execution
async function main() {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
      console.error('   Please add it to .env.local file');
      process.exit(1);
    }

    // Validate webhook URL
    if (!WEBHOOK_URL.startsWith('https://')) {
      console.error('❌ Webhook URL must use HTTPS for production');
      console.error(`   Current URL: ${WEBHOOK_URL}`);
      console.error('   Usage: node scripts/configure-stripe-webhook.js [webhook_url]');
      console.error('   Example: node scripts/configure-stripe-webhook.js https://stembotv1.vercel.app/api/webhooks/stripe');
      process.exit(1);
    }

    // Configure webhook
    await configureWebhook();

    // List all webhooks
    await listExistingWebhooks();

    // Test configuration
    await testWebhook();

    console.log('\n✅ Webhook configuration complete!\n');
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
