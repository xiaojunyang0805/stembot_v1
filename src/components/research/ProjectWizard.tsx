/**
 * Project Wizard Component
 * Guides users through research project creation with AI assistance
 */

'use client'

import { useState } from 'react'

import { ChevronLeft, ChevronRight, Lightbulb, Target, BookOpen, Microscope } from 'lucide-react'

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ResearchField, ResearchStage } from '../../types/research'


interface ProjectWizardProps {
  onComplete: (projectData: ProjectWizardData) => void
  onCancel: () => void
  className?: string
}

export interface ProjectWizardData {
  title: string
  description: string
  field: ResearchField
  initialQuestion: string
  objectives: string[]
  timeframe: {
    startDate: Date
    expectedCompletion: Date
  }
  significance: string
  priorKnowledge: string
}

const RESEARCH_FIELDS: { value: ResearchField; label: string; description: string; icon: any }[] = [
  { value: 'computer-science', label: 'Computer Science', description: 'Software, AI, algorithms, systems', icon: '💻' },
  { value: 'engineering', label: 'Engineering', description: 'Mechanical, electrical, civil, chemical', icon: '⚙️' },
  { value: 'mathematics', label: 'Mathematics', description: 'Pure math, applied math, statistics', icon: '📊' },
  { value: 'physics', label: 'Physics', description: 'Theoretical, experimental, applied physics', icon: '🔬' },
  { value: 'chemistry', label: 'Chemistry', description: 'Organic, inorganic, analytical chemistry', icon: '🧪' },
  { value: 'biology', label: 'Biology', description: 'Molecular, cellular, ecological biology', icon: '🧬' },
  { value: 'psychology', label: 'Psychology', description: 'Cognitive, social, clinical psychology', icon: '🧠' },
  { value: 'economics', label: 'Economics', description: 'Microeconomics, macroeconomics, finance', icon: '📈' },
  { value: 'sociology', label: 'Sociology', description: 'Social structures, behavior, culture', icon: '👥' },
  { value: 'other', label: 'Other', description: 'Interdisciplinary or other fields', icon: '🔬' }
]

export function ProjectWizard({ onComplete, onCancel, className = '' }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<ProjectWizardData>>({
    objectives: [],
    timeframe: {
      startDate: new Date(),
      expectedCompletion: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months from now
    }
  })

  const totalSteps = 5

  const updateFormData = (updates: Partial<ProjectWizardData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const addObjective = () => {
    const objectives = formData.objectives || []
    updateFormData({ objectives: [...objectives, ''] })
  }

  const updateObjective = (index: number, value: string) => {
    const objectives = [...(formData.objectives || [])]
    objectives[index] = value
    updateFormData({ objectives })
  }

  const removeObjective = (index: number) => {
    const objectives = [...(formData.objectives || [])]
    objectives.splice(index, 1)
    updateFormData({ objectives })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.field
      case 2:
        return formData.initialQuestion && formData.initialQuestion.length > 10
      case 3:
        return formData.objectives && formData.objectives.length > 0 && formData.objectives.every(obj => obj.trim())
      case 4:
        return formData.timeframe && formData.significance
      case 5:
        return formData.priorKnowledge
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData as ProjectWizardData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Project Basics</h2>
              <p className="text-gray-600">Let's start with the fundamentals of your research project</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="Enter a descriptive title for your research project"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Project Description *
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Provide a brief overview of what you want to research and why"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Research Field *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {RESEARCH_FIELDS.map((field) => (
                    <button
                      key={field.value}
                      type="button"
                      onClick={() => updateFormData({ field: field.value })}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        formData.field === field.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-lg">{field.icon}</span>
                        <span className="font-medium">{field.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{field.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Lightbulb className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Research Question</h2>
              <p className="text-gray-600">What specific question are you trying to answer?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Initial Research Question *
                </label>
                <textarea
                  value={formData.initialQuestion || ''}
                  onChange={(e) => updateFormData({ initialQuestion: e.target.value })}
                  placeholder="State your research question. Don't worry about perfection - our AI mentor will help you refine it."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Tip: Start with "How does...", "What is the effect of...", or "To what extent..."
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-900">Good Research Questions Are:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Specific and focused</li>
                  <li>• Answerable with available methods</li>
                  <li>• Significant to your field</li>
                  <li>• Clear and unambiguous</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Research Objectives</h2>
              <p className="text-gray-600">What specific goals do you want to achieve?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Research Objectives *
                </label>
                <p className="mb-3 text-sm text-gray-600">
                  List the specific, measurable goals of your research project.
                </p>

                <div className="space-y-2">
                  {(formData.objectives || []).map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => updateObjective(index, e.target.value)}
                        placeholder={`Objective ${index + 1}`}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeObjective(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={addObjective}
                  className="mt-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  + Add Objective
                </Button>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-purple-900">Objective Examples:</h4>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>• To determine the relationship between X and Y</li>
                  <li>• To evaluate the effectiveness of method Z</li>
                  <li>• To develop a model for predicting outcome A</li>
                  <li>• To compare approaches B and C in context D</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Project Timeline & Significance</h2>
              <p className="text-gray-600">When will you work on this and why does it matter?</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.timeframe?.startDate.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFormData({
                      timeframe: {
                        ...formData.timeframe!,
                        startDate: new Date(e.target.value)
                      }
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Expected Completion
                  </label>
                  <input
                    type="date"
                    value={formData.timeframe?.expectedCompletion.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFormData({
                      timeframe: {
                        ...formData.timeframe!,
                        expectedCompletion: new Date(e.target.value)
                      }
                    })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Research Significance *
                </label>
                <textarea
                  value={formData.significance || ''}
                  onChange={(e) => updateFormData({ significance: e.target.value })}
                  placeholder="Why is this research important? What impact could it have? Who would benefit from the results?"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Microscope className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Prior Knowledge</h2>
              <p className="text-gray-600">What do you already know about this topic?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Prior Knowledge & Experience *
                </label>
                <textarea
                  value={formData.priorKnowledge || ''}
                  onChange={(e) => updateFormData({ priorKnowledge: e.target.value })}
                  placeholder="Describe your current understanding of the topic, relevant coursework, previous research experience, or any initial reading you've done. This helps our AI mentor provide better guidance."
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-green-900">
                  🎉 Ready to Start Your Research Journey!
                </h4>
                <p className="text-sm text-green-800">
                  Once you complete this step, our AI research mentor will create a personalized
                  memory system for your project and guide you through each phase of the research process.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={`mx-auto max-w-4xl p-8 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm text-gray-600">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="mt-8 flex justify-between border-t border-gray-200 pt-8">
        <Button
          variant="ghost"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="text-gray-600 hover:text-gray-700"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {currentStep === totalSteps ? 'Create Project' : 'Next'}
          {currentStep < totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </Card>
  )
}