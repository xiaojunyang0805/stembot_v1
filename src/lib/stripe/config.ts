// Mock Stripe configuration for UI-only components
export const stripePromise = Promise.resolve(null);

export const prices = {
  pro_monthly: 'price_mock_pro_monthly',
  student_monthly: 'price_mock_student_monthly',
  pro_annual: 'price_mock_pro_annual',
  department_license: 'price_mock_department_license',
  institution_license: 'price_mock_institution_license'
};

export const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['Basic research tools', 'Limited AI assistance']
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 19,
    interval: 'month',
    features: ['Advanced research tools', 'Unlimited AI assistance', 'Priority support']
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 15,
    interval: 'month',
    features: ['Advanced research tools', 'Unlimited AI assistance', 'Priority support', '2 months free']
  },
  {
    id: 'student_monthly',
    name: 'Student Monthly',
    price: 9,
    interval: 'month',
    features: ['Student verification required', 'Unlimited AI tutoring', 'Study guides']
  },
  {
    id: 'department_license',
    name: 'Department License',
    price: 499,
    interval: 'month',
    features: ['Unlimited seats', 'Department analytics', 'Custom integrations']
  },
  {
    id: 'institution_license',
    name: 'Institution License',
    price: 999,
    interval: 'month',
    features: ['Unlimited seats', 'Institution-wide analytics', 'Custom branding']
  }
];

// Mock pricing configuration
export const PRICING = plans;

export const STRIPE_PRODUCTS = {
  hobby: { monthly: prices.pro_monthly },
  pro: { monthly: prices.pro_monthly, annual: prices.pro_annual },
  student: { monthly: prices.student_monthly },
  PRO_MONTHLY: prices.pro_monthly,
  PRO_ANNUAL: prices.pro_annual,
  STUDENT_MONTHLY: prices.student_monthly,
  DEPARTMENT_LICENSE: prices.department_license,
  INSTITUTION_LICENSE: prices.institution_license
};

// Add indexed access for PRICING
(PRICING as any).FREE = PRICING[0];
(PRICING as any).PRO_MONTHLY = PRICING[1];
(PRICING as any).PRO_ANNUAL = PRICING[2];
(PRICING as any).STUDENT_MONTHLY = PRICING[3];
(PRICING as any).DEPARTMENT_LICENSE = PRICING[4];
(PRICING as any).INSTITUTION_LICENSE = PRICING[5];