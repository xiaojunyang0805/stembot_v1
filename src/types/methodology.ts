/**
 * Methodology Types
 * Defines interfaces for research methodology design and validation
 */

export interface Methodology {
  id: string
  projectId: string

  // Core methodology
  approach: ResearchApproach
  design: ResearchDesign
  methods: ResearchMethod[]
  analysis: AnalysisStrategy

  // Validation
  validity: ValidityAssessment
  reliability: ReliabilityAssessment
  ethics: EthicsConsiderations

  // Planning
  timeline: MethodologyTimeline
  resources: ResourceRequirements
  risks: RiskAssessment[]

  createdAt: Date
  updatedAt: Date
}

export interface ResearchApproach {
  paradigm: 'positivist' | 'interpretivist' | 'pragmatic' | 'critical'
  type: 'quantitative' | 'qualitative' | 'mixed-methods'
  justification: string
  strengths: string[]
  limitations: string[]
}

export interface ResearchDesign {
  type: 'experimental' | 'quasi-experimental' | 'correlational' | 'descriptive' | 'exploratory' | 'case-study' | 'survey' | 'ethnographic'
  description: string
  rationale: string
  population: PopulationDescription
  sampling: SamplingStrategy
  variables: Variable[]
}

export interface PopulationDescription {
  target: string
  accessible: string
  size: number
  characteristics: string[]
  inclusionCriteria: string[]
  exclusionCriteria: string[]
}

export interface SamplingStrategy {
  method: 'random' | 'stratified' | 'cluster' | 'convenience' | 'purposive' | 'snowball'
  size: number
  powerAnalysis?: PowerAnalysis
  justification: string
}

export interface PowerAnalysis {
  effectSize: number
  alpha: number
  power: number
  calculatedSampleSize: number
  assumptions: string[]
}

export interface Variable {
  id: string
  name: string
  type: 'independent' | 'dependent' | 'control' | 'moderator' | 'mediator'
  definition: string
  measurement: MeasurementStrategy
  scale: 'nominal' | 'ordinal' | 'interval' | 'ratio'
}

export interface MeasurementStrategy {
  instrument: string
  description: string
  validity: string
  reliability: string
  administration: string
}

export interface ResearchMethod {
  id: string
  name: string
  type: 'data-collection' | 'data-analysis' | 'validation'
  description: string
  procedures: string[]
  tools: string[]
  timeline: string
  personnel: string[]
}

export interface AnalysisStrategy {
  descriptive: string[]
  inferential: string[]
  software: string[]
  procedures: AnalysisProcedure[]
  interpretation: string
}

export interface AnalysisProcedure {
  id: string
  name: string
  purpose: string
  assumptions: string[]
  steps: string[]
  output: string
}

export interface ValidityAssessment {
  internal: {
    threats: string[]
    controls: string[]
    score: number
  }
  external: {
    limitations: string[]
    generalizability: string
    score: number
  }
  construct: {
    evidence: string[]
    concerns: string[]
    score: number
  }
  statistical: {
    assumptions: string[]
    violations: string[]
    score: number
  }
}

export interface ReliabilityAssessment {
  type: 'test-retest' | 'internal-consistency' | 'inter-rater' | 'parallel-forms'
  measures: string[]
  expectedValues: number[]
  threats: string[]
  controls: string[]
}

export interface EthicsConsiderations {
  irbRequired: boolean
  irbStatus?: 'not-submitted' | 'submitted' | 'approved' | 'conditional' | 'denied'
  concerns: EthicsIssue[]
  protections: string[]
  consent: ConsentRequirements
  risks: EthicsRisk[]
  benefits: string[]
}

export interface EthicsIssue {
  issue: string
  severity: 'low' | 'medium' | 'high'
  mitigation: string
  status: 'identified' | 'addressed' | 'ongoing'
}

export interface ConsentRequirements {
  required: boolean
  type: 'written' | 'verbal' | 'implied' | 'waived'
  elements: string[]
  special: string[]
}

export interface EthicsRisk {
  type: 'physical' | 'psychological' | 'social' | 'economic' | 'legal'
  description: string
  probability: number
  severity: number
  mitigation: string[]
}

export interface MethodologyTimeline {
  phases: MethodologyPhase[]
  totalDuration: number
  criticalPath: string[]
  dependencies: PhaseDependency[]
}

export interface MethodologyPhase {
  id: string
  name: string
  description: string
  duration: number
  startDate?: Date
  endDate?: Date
  deliverables: string[]
  resources: string[]
}

export interface PhaseDependency {
  prerequisite: string
  dependent: string
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish'
  lag: number
}

export interface ResourceRequirements {
  personnel: PersonnelRequirement[]
  equipment: EquipmentRequirement[]
  software: SoftwareRequirement[]
  materials: MaterialRequirement[]
  budget: BudgetEstimate
}

export interface PersonnelRequirement {
  role: string
  timeCommitment: number
  skills: string[]
  training: string[]
}

export interface EquipmentRequirement {
  item: string
  quantity: number
  cost?: number
  availability: string
}

export interface SoftwareRequirement {
  name: string
  license: string
  cost?: number
  version: string
}

export interface MaterialRequirement {
  item: string
  quantity: number
  cost?: number
  supplier?: string
}

export interface BudgetEstimate {
  personnel: number
  equipment: number
  software: number
  materials: number
  travel: number
  other: number
  total: number
  contingency: number
}

export interface RiskAssessment {
  id: string
  risk: string
  category: 'technical' | 'timeline' | 'resource' | 'quality' | 'external'
  probability: number
  impact: number
  severity: number
  mitigation: string[]
  contingency: string[]
  status: 'identified' | 'monitored' | 'active' | 'mitigated'
}

// Database table interfaces
export interface MethodologyTable {
  id: string
  project_id: string
  approach: Record<string, any>
  design: Record<string, any>
  methods: Record<string, any>[]
  analysis: Record<string, any>
  validation: Record<string, any>
  created_at: string
  updated_at: string
}

// Additional interfaces for component compatibility
export interface MethodologyDesign {
  id: string;
  name: string;
  type: ResearchDesign['type'];
  description: string;
  components: string[];
  template: MethodologyTemplate;
  validation: MethodologyValidation;
  createdAt: Date;
  updatedAt: Date;

  // Additional properties for component compatibility
  projectId?: string;
  researchQuestion?: string;
  approach?: string;
  methods?: any[];
  dataCollection?: any;
  analysis?: any;
  ethicsConsiderations?: any;
  feasibilityChecks?: any;
  feasibility?: any;
}

export interface MethodologyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: TemplateField[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
}

export interface MethodologyValidation {
  id: string;
  methodologyId: string;
  validationChecks: ValidationCheck[];
  overallScore: number;
  recommendations: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  completedAt?: Date;

  // Additional properties for component compatibility
  isValid?: boolean;
  issues?: string[];
  suggestions?: string[];
  scores?: { [key: string]: number };
}

export interface ValidationCheck {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface DataCollectionPlan {
  id: string;
  methodologyId: string;
  methods: DataCollectionMethod[];
  timeline: CollectionTimeline;
  resources: CollectionResources;
  qualityControl: QualityControlMeasures;
  status: 'planned' | 'in-progress' | 'completed' | 'paused';
}

export interface DataCollectionMethod {
  id: string;
  name: string;
  type: 'survey' | 'interview' | 'observation' | 'experiment' | 'document-analysis';
  description: string;
  procedures: string[];
  instruments: string[];
  targetSampleSize: number;
  estimatedDuration: number;
}

export interface CollectionTimeline {
  startDate: Date;
  endDate: Date;
  phases: CollectionPhase[];
  milestones: string[];
}

export interface CollectionPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  methods: string[];
  deliverables: string[];
}

export interface CollectionResources {
  personnel: string[];
  equipment: string[];
  software: string[];
  budget: number;
  locations: string[];
}

export interface QualityControlMeasures {
  procedures: string[];
  checkpoints: string[];
  validationMethods: string[];
  errorChecking: string[];
  dataIntegrity: string[];
}