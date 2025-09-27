import type { ObjectId } from "mongodb"

export interface Question {
  id: string
  type: "text" | "video" | "multiple-choice"
  question: string
  timeLimit?: number
  options?: string[]
  required: boolean
}

export interface Template {
  _id?: ObjectId
  companyId: ObjectId
  title: string
  description: string
  questions: Question[]
  estimatedDuration: number
  isActive: boolean
  agentId?: string // Added field to store ElevenLabs agent ID
  difficulty?: "beginner" | "intermediate" | "advanced" // For student practice
  category?: string // For organizing templates
  isPublic?: boolean // Whether template is available for public practice
  practiceAllowed?: boolean // Whether students can practice with this template
  createdAt: Date
  updatedAt: Date
}
