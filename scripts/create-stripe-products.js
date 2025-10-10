/**
 * Stripe Product Creation Script for StemBot
 *
 * This script automatically creates the two subscription products:
 * 1. StemBot Student Pro - €10/month
 * 2. StemBot Researcher - €25/month
 *
 * Usage:
 *   node scripts/create-stripe-products.js
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY must be set in .env.local
 *   - stripe package must be installed (npm install stripe)
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createStripeProducts() {
  log('\n🚀 StemBot Stripe Product Creation Script\n', 'bright');

  // Validate environment variable
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    log('❌ ERROR: STRIPE_SECRET_KEY not found in .env.local', 'red');
    log('\nPlease add your Stripe secret key to .env.local:', 'yellow');
    log('STRIPE_SECRET_KEY=sk_live_...', 'cyan');
    process.exit(1);
  }

  if (!secretKey.startsWith('sk_')) {
    log('❌ ERROR: Invalid Stripe secret key format', 'red');
    log('Secret key should start with sk_test_ or sk_live_', 'yellow');
    process.exit(1);
  }

  // Initialize Stripe
  const stripe = new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  });

  const mode = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  log(`📡 Connected to Stripe in ${mode} mode`, mode === 'LIVE' ? 'red' : 'green');
  log('─'.repeat(60), 'cyan');

  try {
    // Product 1: StemBot Student Pro
    log('\n📦 Creating Product 1: StemBot Student Pro...', 'blue');

    const studentProProduct = await stripe.products.create({
      name: 'StemBot Student Pro',
      description: 'Unlimited AI tutoring, up to 10 active research projects, priority support',
      metadata: {
        tier: 'student_pro',
        ai_interactions: 'unlimited',
        max_projects: '10',
        priority_support: 'true',
      },
    });

    log(`✅ Product created: ${studentProProduct.id}`, 'green');

    const studentProPrice = await stripe.prices.create({
      product: studentProProduct.id,
      currency: 'eur',
      unit_amount: 1000, // €10.00 in cents
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'student_pro',
      },
    });

    log(`✅ Price created: ${studentProPrice.id}`, 'green');
    log(`   Amount: €10.00/month`, 'cyan');

    // Product 2: StemBot Researcher
    log('\n📦 Creating Product 2: StemBot Researcher...', 'blue');

    const researcherProduct = await stripe.products.create({
      name: 'StemBot Researcher',
      description: 'Everything in Student Pro plus unlimited projects, advanced research tools, collaboration features',
      metadata: {
        tier: 'researcher',
        ai_interactions: 'unlimited',
        max_projects: 'unlimited',
        priority_support: 'true',
        advanced_tools: 'true',
        collaboration: 'true',
      },
    });

    log(`✅ Product created: ${researcherProduct.id}`, 'green');

    const researcherPrice = await stripe.prices.create({
      product: researcherProduct.id,
      currency: 'eur',
      unit_amount: 2500, // €25.00 in cents
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'researcher',
      },
    });

    log(`✅ Price created: ${researcherPrice.id}`, 'green');
    log(`   Amount: €25.00/month`, 'cyan');

    // Success summary
    log('\n' + '═'.repeat(60), 'green');
    log('🎉 SUCCESS! Products created successfully!', 'green');
    log('═'.repeat(60) + '\n', 'green');

    log('📝 NEXT STEPS:', 'bright');
    log('\n1️⃣  Add these Price IDs to your .env.local:\n', 'yellow');

    log(`STRIPE_STUDENT_PRO_PRICE_ID=${studentProPrice.id}`, 'cyan');
    log(`STRIPE_RESEARCHER_PRICE_ID=${researcherPrice.id}`, 'cyan');

    log('\n2️⃣  Add the same variables to Vercel Dashboard:', 'yellow');
    log('   → https://vercel.com/dashboard → Settings → Environment Variables\n', 'cyan');

    log('3️⃣  Verify products in Stripe Dashboard:', 'yellow');
    log(`   → https://dashboard.stripe.com/${mode === 'LIVE' ? '' : 'test/'}products\n`, 'cyan');

    log('4️⃣  Configure webhook endpoint:', 'yellow');
    log('   → See STRIPE_SETUP.md Step 2 for webhook configuration\n', 'cyan');

    // Output summary object for easy copy-paste
    log('\n📋 SUMMARY (copy to .env.local):\n', 'bright');
    log('# Stripe Product Price IDs (created by script)', 'cyan');
    log(`STRIPE_STUDENT_PRO_PRICE_ID=${studentProPrice.id}`, 'cyan');
    log(`STRIPE_RESEARCHER_PRICE_ID=${researcherPrice.id}`, 'cyan');

    // Create a summary file
    const fs = require('fs');
    const summaryPath = 'stripe-products-summary.txt';
    const summary = `
StemBot Stripe Products - Created ${new Date().toISOString()}
Mode: ${mode}
════════════════════════════════════════════════════════════

PRODUCT 1: StemBot Student Pro
─────────────────────────────────
Product ID: ${studentProProduct.id}
Price ID:   ${studentProPrice.id}
Amount:     €10.00/month
Description: ${studentProProduct.description}

PRODUCT 2: StemBot Researcher
─────────────────────────────────
Product ID: ${researcherProduct.id}
Price ID:   ${researcherPrice.id}
Amount:     €25.00/month
Description: ${researcherProduct.description}

════════════════════════════════════════════════════════════
ENVIRONMENT VARIABLES TO ADD:
════════════════════════════════════════════════════════════

Add to .env.local:
STRIPE_STUDENT_PRO_PRICE_ID=${studentProPrice.id}
STRIPE_RESEARCHER_PRICE_ID=${researcherPrice.id}

Add to Vercel Dashboard → Settings → Environment Variables:
STRIPE_STUDENT_PRO_PRICE_ID=${studentProPrice.id}
STRIPE_RESEARCHER_PRICE_ID=${researcherPrice.id}

════════════════════════════════════════════════════════════
NEXT STEPS:
════════════════════════════════════════════════════════════

1. Add Price IDs to .env.local and Vercel
2. Configure webhook endpoint (see STRIPE_SETUP.md Step 2)
3. Apply Supabase migration: npx supabase db push
4. Test checkout flow in development

View products: https://dashboard.stripe.com/${mode === 'LIVE' ? '' : 'test/'}products
`;

    fs.writeFileSync(summaryPath, summary);
    log(`\n💾 Summary saved to: ${summaryPath}`, 'green');
    log('\n✨ All done! Ready for WP6.2 (Checkout Flow)\n', 'bright');

  } catch (error) {
    log('\n❌ ERROR creating products:', 'red');
    log(error.message, 'red');

    if (error.type === 'StripeAuthenticationError') {
      log('\n⚠️  Authentication failed. Please check your STRIPE_SECRET_KEY', 'yellow');
    } else if (error.type === 'StripeAPIError') {
      log('\n⚠️  Stripe API error. Please try again or check Stripe Dashboard', 'yellow');
    }

    process.exit(1);
  }
}

// Run the script
createStripeProducts();
