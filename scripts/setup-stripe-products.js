/**
 * Script to create Stripe products and prices
 * Run this once to set up all products in your Stripe account
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  console.log('🚀 Creating Stripe products and prices...');

  try {
    // Create main product
    const product = await stripe.products.create({
      name: 'StemBot Research Mentor',
      description: 'AI-powered research mentoring platform for students',
      metadata: {
        platform: 'stembot',
      },
    });

    console.log('✅ Product created:', product.id);

    // Create Pro Monthly price
    const proMonthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 1500, // €15.00
      currency: 'eur',
      recurring: {
        interval: 'month',
        trial_period_days: 7,
      },
      nickname: 'Pro Monthly',
      metadata: {
        tier: 'pro_monthly',
      },
    });

    console.log('✅ Pro Monthly price created:', proMonthly.id);

    // Create Student Monthly price
    const studentMonthly = await stripe.prices.create({
      product: product.id,
      unit_amount: 1000, // €10.00
      currency: 'eur',
      recurring: {
        interval: 'month',
        trial_period_days: 7,
      },
      nickname: 'Student Monthly',
      metadata: {
        tier: 'student_monthly',
        requires_verification: 'university_email',
      },
    });

    console.log('✅ Student Monthly price created:', studentMonthly.id);

    // Create Pro Annual price
    const proAnnual = await stripe.prices.create({
      product: product.id,
      unit_amount: 12000, // €120.00
      currency: 'eur',
      recurring: {
        interval: 'year',
        trial_period_days: 7,
      },
      nickname: 'Pro Annual',
      metadata: {
        tier: 'pro_annual',
        savings: '2_months_free',
      },
    });

    console.log('✅ Pro Annual price created:', proAnnual.id);

    // Create Department License product
    const departmentProduct = await stripe.products.create({
      name: 'StemBot Department License',
      description: 'Department license for up to 50 students',
      metadata: {
        platform: 'stembot',
        type: 'department',
      },
    });

    const departmentLicense = await stripe.prices.create({
      product: departmentProduct.id,
      unit_amount: 50000, // €500.00
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      nickname: 'Department License',
      metadata: {
        tier: 'department_license',
        seats: '50',
      },
    });

    console.log('✅ Department License created:', departmentLicense.id);

    // Create Institution License product
    const institutionProduct = await stripe.products.create({
      name: 'StemBot Institution License',
      description: 'Institution-wide license with unlimited students',
      metadata: {
        platform: 'stembot',
        type: 'institution',
      },
    });

    const institutionLicense = await stripe.prices.create({
      product: institutionProduct.id,
      unit_amount: 200000, // €2000.00
      currency: 'eur',
      recurring: {
        interval: 'year',
      },
      nickname: 'Institution License',
      metadata: {
        tier: 'institution_license',
        seats: 'unlimited',
      },
    });

    console.log('✅ Institution License created:', institutionLicense.id);

    // Create customer portal configuration
    const portalConfig = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'StemBot Research Mentor',
        privacy_policy_url: 'https://stembotv1.vercel.app/privacy',
        terms_of_service_url: 'https://stembotv1.vercel.app/terms',
      },
      features: {
        customer_update: {
          enabled: true,
          allowed_updates: ['email', 'tax_id'],
        },
        invoice_history: {
          enabled: true,
        },
        payment_method_update: {
          enabled: true,
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other',
            ],
          },
        },
        subscription_pause: {
          enabled: false,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
        },
      },
    });

    console.log('✅ Customer portal configured:', portalConfig.id);

    // Output environment variables to add
    console.log('\n📝 Add these to your .env.local file:');
    console.log(`STRIPE_PRO_MONTHLY_PRICE_ID=${proMonthly.id}`);
    console.log(`STRIPE_STUDENT_MONTHLY_PRICE_ID=${studentMonthly.id}`);
    console.log(`STRIPE_PRO_ANNUAL_PRICE_ID=${proAnnual.id}`);
    console.log(`STRIPE_DEPARTMENT_LICENSE_PRICE_ID=${departmentLicense.id}`);
    console.log(`STRIPE_INSTITUTION_LICENSE_PRICE_ID=${institutionLicense.id}`);
    console.log(`STRIPE_PORTAL_CONFIG_ID=${portalConfig.id}`);

    // Create webhook endpoint
    console.log('\n🔗 Setting up webhook endpoint...');
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: 'https://stembotv1.vercel.app/api/webhooks/stripe',
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'payment_method.attached',
        'payment_method.detached',
      ],
    });

    console.log('✅ Webhook endpoint created:', webhookEndpoint.url);
    console.log(`STRIPE_WEBHOOK_SECRET=${webhookEndpoint.secret}`);

    console.log('\n✅ All Stripe products and prices created successfully!');
    console.log('   Don\'t forget to add the environment variables to your .env.local file');
    console.log('   and to Vercel environment settings.');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error);
    process.exit(1);
  }
}

// Run the script
createProducts();