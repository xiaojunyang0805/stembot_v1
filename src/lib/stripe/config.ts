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
    currency: 'USD',
    interval: 'month',
    features: {
      projects: 3,
      aiInteractions: 100,
      memoryType: 'basic',
      support: 'community',
      exportFormats: ['pdf'],
      collaboration: false,
      adminDashboard: false,
      usageAnalytics: false
    },
    limits: {
      maxProjects: 3,
      monthlyAiInteractions: 100,
      maxSourcesPerProject: 10,
      maxFileSize: 5
    }
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 19,
    currency: 'USD',
    interval: 'month',
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'advanced',
      support: 'priority',
      exportFormats: ['pdf', 'docx', 'latex'],
      collaboration: true,
      adminDashboard: false,
      usageAnalytics: true
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 100,
      maxFileSize: 50
    }
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: 15,
    currency: 'USD',
    interval: 'month',
    features: {
      projects: 'unlimited',
      aiInteractions: 'unlimited',
      memoryType: 'advanced',
      support: 'priority',
      exportFormats: ['pdf', 'docx', 'latex'],
      collaboration: true,
      adminDashboard: false,
      usageAnalytics: true,
      savings: '17%'
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 100,
      maxFileSize: 50
    }
  },
  {
    id: 'student_monthly',
    name: 'Student Monthly',
    price: 9,
    currency: 'USD',
    interval: 'month',
    features: {
      projects: 10,
      aiInteractions: 'unlimited',
      memoryType: 'advanced',
      support: 'standard',
      exportFormats: ['pdf', 'docx'],
      collaboration: true,
      adminDashboard: false,
      usageAnalytics: false
    },
    limits: {
      maxProjects: 10,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 50,
      maxFileSize: 25
    },
    requirements: {
      universityEmail: true,
      verification: 'Student verification required'
    }
  },
  {
    id: 'department_license',
    name: 'Department License',
    price: 499,
    currency: 'USD',
    interval: 'month',
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
      seats: 100
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 500,
      maxFileSize: 100
    }
  },
  {
    id: 'institution_license',
    name: 'Institution License',
    price: 999,
    currency: 'USD',
    interval: 'month',
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
      seats: 'unlimited'
    },
    limits: {
      maxProjects: -1,
      monthlyAiInteractions: -1,
      maxSourcesPerProject: 1000,
      maxFileSize: 500
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