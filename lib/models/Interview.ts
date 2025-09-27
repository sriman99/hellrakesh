import type { ObjectId } from "mongodb"

export interface CandidateResponse {
  questionId: string
  response: string
  videoUrl?: string
  audioUrl?: string
  duration: number
  timestamp: Date
}

export interface Interview {
  _id?: ObjectId
  companyId: ObjectId
  templateId: ObjectId
  candidateName: string
  candidateEmail: string
  uniqueLink: string
  status: "pending" | "in-progress" | "completed" | "expired"
  responses: CandidateResponse[]
  score?: number
  feedback?: string
  conversationId?: string // Added field to store the ElevenLabs conversation ID
  audio?: string // Added field to store the audio file URL (local backup)
  audioS3?: string // Added field to store the S3 audio file URL (primary)
  video?: string // Added field to store the video file path (local backup - user only)
  videoS3?: string // Added field to store the S3 video file URL (primary - user only)
  videoComplete?: string // Added field to store the complete video file path (local backup - with system audio)
  videoCompleteS3?: string // Added field to store the S3 complete video file URL (primary - with system audio)
  transcript?: string[] // Added field to store the transcript
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: {
    sessionType: 'practice' | 'interview' | 'demo'
    userRole: 'student' | 'company' | 'admin'
    userId: string
    quotaType: 'practiceUsed' | 'interviewsUsed'
  }
  // Deprecated: Use metadata.sessionType === 'practice' instead
  isStudentPractice?: boolean
  analysis?: {
    localMetrics: {
      avgLatency: string
      avgWords: string
      vocabRichness: string
      clarity: string
    }
    aiMetrics: {
      correctness: number
      relevance: number
      completeness: number
      confidence: number
      professionalism: number
      recommendation: string
    }
  } // Updated to include both local and LLM-based metrics
  finalScore?: {
    score: number
    breakdown: {
      latency: string
      avgWords: string
      vocabRichness: string
      clarity: string
      correctness: number
      relevance: number
      completeness: number
      confidence: number
      professionalism: number
    }
    interpretation: string
  } // Updated to include LLM-based metrics in the breakdown
}
