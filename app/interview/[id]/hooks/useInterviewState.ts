import { useState } from "react"

type InterviewStep = "welcome" | "permissions" | "interview" | "complete"

export interface InterviewState {
  currentStep: InterviewStep
  interviewStarted: boolean
  currentQuestionIndex: number
  timeRemaining: number
  responses: string[]
  warnings: number
  warningMessage: string | null
  completionData: any
  loadingResults: boolean
}

export function useInterviewState() {
  const [currentStep, setCurrentStep] = useState<InterviewStep>("welcome")
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [warnings, setWarnings] = useState(0)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [completionData, setCompletionData] = useState<any>(null)
  const [loadingResults, setLoadingResults] = useState(false)

  const nextStep = () => {
    if (currentStep === "welcome") setCurrentStep("permissions")
    else if (currentStep === "permissions") setCurrentStep("interview")
    else if (currentStep === "interview") setCurrentStep("complete")
  }

  const startInterview = () => {
    setInterviewStarted(true)
    setCurrentStep("interview")
  }

  const completeInterview = () => {
    setInterviewStarted(false)
    setCurrentStep("complete")
  }

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1)
  }

  const resetTimer = (seconds: number) => {
    setTimeRemaining(seconds)
  }

  const decrementTimer = () => {
    setTimeRemaining(prev => Math.max(0, prev - 1))
  }

  const addResponse = (response: string) => {
    setResponses(prev => [...prev, response])
  }

  const addWarning = (message: string) => {
    setWarnings(prev => prev + 1)
    setWarningMessage(message)
    setTimeout(() => setWarningMessage(null), 3000)
  }

  return {
    // State
    currentStep,
    interviewStarted,
    currentQuestionIndex,
    timeRemaining,
    responses,
    warnings,
    warningMessage,
    completionData,
    loadingResults,
    
    // Actions
    setCurrentStep,
    setInterviewStarted,
    setCurrentQuestionIndex,
    setTimeRemaining,
    setResponses,
    setWarnings,
    setWarningMessage,
    setCompletionData,
    setLoadingResults,
    nextStep,
    startInterview,
    completeInterview,
    nextQuestion,
    resetTimer,
    decrementTimer,
    addResponse,
    addWarning,
  }
}