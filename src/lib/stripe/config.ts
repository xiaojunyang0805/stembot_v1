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
    currency: 'EUR',
    interval: 'month',
    trialDays: 7,
    features: {
      projects: 1,
      aiInteractions: 50,
      memoryType: 'basic',
      support: 'community',
      exportFormats: ['pdf'],
      collaboration: false,
      adminDashboard: false,
      usageAnalytics: false,
      advancedMemory: false
    },
    limits: {
      maxProjects: 1,
      monthlyAiInteractions: 50,
      maxSourcesPerProject: 5,
      maxFileSize: 5,
      memoryRetention: 30 // days
    }
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 15,
    currency: 'EUR',
    interval: 'month',
    trialDays: 7,
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'advanced',
      support: 'priority',
      exportFormats: ['pdf', 'docx', 'latex'],
      collaboration: true,
      adminDashboard: false,
      usageAnalytics: true,
      advancedMemory: true,
      prioritySupport: true
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 100,
      maxFileSize: 50,
      memoryRetention: -1 // unlimited
    }
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 10, // €120/year = €10/month equivalent
    yearlyPrice: 120,
    currency: 'EUR',
    interval: 'year',
    trialDays: 7,
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'advanced',
      support: 'priority',
      exportFormats: ['pdf', 'docx', 'latex'],
      collaboration: true,
      adminDashboard: false,
      usageAnalytics: true,
      advancedMemory: true,
      prioritySupport: true,
      savings: '33% off (2 months free)'
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 100,
      maxFileSize: 50,
      memoryRetention: -1
    }
  },
  {
    id: 'student_monthly',
    name: 'Student',
    price: 10,
    currency: 'EUR',
    interval: 'month',
    trialDays: 7,
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'advanced',
      support: 'standard',
      exportFormats: ['pdf', 'docx'],
      collaboration: true,
      adminDashboard: false,
      usageAnalytics: false,
      advancedMemory: true,
      discount: 'Student discount'
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 50,
      maxFileSize: 25,
      memoryRetention: -1
    },
    requirements: {
      universityEmail: true,
      verification: 'University email verification required'
    }
  },
  {
    id: 'department_license',
    name: 'Department License',
    price: 42, // €500/year = ~€42/month
    yearlyPrice: 500,
    currency: 'EUR',
    interval: 'year',
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'enterprise',
      support: 'dedicated',
      exportFormats: ['pdf', 'docx', 'latex', 'csv'],
      collaboration: true,
      adminDashboard: true,
      usageAnalytics: true,
      customBranding: false,
      seats: 50,
      bulkManagement: true,
      dedicatedSupport: true
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 500,
      maxFileSize: 100,
      memoryRetention: -1,
      maxUsers: 50
    }
  },
  {
    id: 'institution_license',
    name: 'Institution License',
    price: 167, // €2000/year = ~€167/month
    yearlyPrice: 2000,
    currency: 'EUR',
    interval: 'year',
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'enterprise',
      support: 'dedicated',
      exportFormats: ['pdf', 'docx', 'latex', 'csv'],
      collaboration: true,
      adminDashboard: true,
      usageAnalytics: true,
      customBranding: true,
      sso: true,
      seats: 'unlimited',
      bulkManagement: true,
      dedicatedSupport: true,
      customIntegrations: true
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 1000,
      maxFileSize: 500,
      memoryRetention: -1,
      maxUsers: -1
    }
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