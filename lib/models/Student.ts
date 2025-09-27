import type { ObjectId } from "mongodb"

export interface PracticeSession {
    _id?: ObjectId
    sessionId: string
    templateId: ObjectId
    templateName: string
    startedAt: Date
    completedAt?: Date
    status: "in-progress" | "completed" | "abandoned"
    responses: SessionResponse[]
    score?: number
    feedback?: string
    audioUrl?: string
    audioS3?: string
    videoUrl?: string
    videoS3?: string
    transcript?: string[]
    duration: number // in seconds
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
    }
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
    }
}

export interface SessionResponse {
    questionId: string
    question: string
    response: string
    videoUrl?: string
    audioUrl?: string
    duration: number
    timestamp: Date
}

export interface StudentAnalytics {
    totalSessions: number
    completedSessions: number
    averageScore: number
    timeSpent: number // total time in seconds
    improvementTrend: number[] // scores over last 10 sessions
    strongAreas: string[]
    weakAreas: string[]
    lastActivity: Date
    streakDays: number
    preferredPracticeTime: "morning" | "afternoon" | "evening" | "night"
    skillProgress: {
        communication: number
        technicalKnowledge: number
        problemSolving: number
        confidence: number
        professionalism: number
    }
}

export interface StudentPreferences {
    emailNotifications: boolean
    practiceReminders: boolean
    reminderFrequency: "daily" | "weekly" | "biweekly" | "monthly"
    preferredDifficulty: "beginner" | "intermediate" | "advanced"
    focusAreas: string[]
    language: string
    timezone: string
}

export interface Student {
    _id?: ObjectId
    email: string
    password: string
    firstName: string
    lastName: string
    university?: string
    major?: string
    graduationYear?: number
    targetRole?: string
    phoneNumber?: string
    linkedinProfile?: string
    resumeUrl?: string
    profilePicture?: string
    isEmailVerified: boolean
    emailVerificationToken?: string
    passwordResetToken?: string
    passwordResetExpires?: Date
    lastLoginAt?: Date
    loginCount: number
    accountStatus: "active" | "suspended" | "pending_verification"
    practiceQuota: number // monthly practice sessions allowed
    practiceUsed: number // practice sessions used this month
    quotaResetDate: Date // when quota resets (monthly)
    sessions: PracticeSession[]
    analytics: StudentAnalytics
    preferences: StudentPreferences
    subscriptionTier: "free" | "premium" | "pro"
    subscriptionExpires?: Date
    createdAt: Date
    updatedAt: Date
}

export interface StudentRegistration {
    email: string
    password: string
    firstName: string
    lastName: string
    university?: string
    major?: string
    graduationYear?: number
    targetRole?: string
    phoneNumber?: string
    agreeToTerms: boolean
    subscribeToNewsletter?: boolean
}

export interface StudentLogin {
    email: string
    password: string
    rememberMe?: boolean
}

export interface StudentProfile {
    firstName: string
    lastName: string
    university?: string
    major?: string
    graduationYear?: number
    targetRole?: string
    phoneNumber?: string
    linkedinProfile?: string
    resumeUrl?: string
    profilePicture?: string
    preferences: StudentPreferences
}

// Helper functions for analytics
export function calculateStudentAnalytics(sessions: PracticeSession[]): StudentAnalytics {
    const completedSessions = sessions.filter(s => s.status === "completed")
    const totalSessions = sessions.length

    const averageScore = completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
        : 0

    const timeSpent = completedSessions.reduce((sum, s) => sum + s.duration, 0)

    const improvementTrend = completedSessions
        .slice(-10)
        .map(s => s.score || 0)

    const lastActivity = sessions.length > 0
        ? sessions.reduce((latest, s) => s.startedAt > latest ? s.startedAt : latest, sessions[0].startedAt)
        : new Date()

    // Calculate streak days (simplified)
    const streakDays = calculateStreakDays(sessions)

    return {
        totalSessions,
        completedSessions: completedSessions.length,
        averageScore,
        timeSpent,
        improvementTrend,
        strongAreas: [], // To be calculated based on session analysis
        weakAreas: [], // To be calculated based on session analysis
        lastActivity,
        streakDays,
        preferredPracticeTime: "afternoon", // Default, to be calculated
        skillProgress: {
            communication: averageScore,
            technicalKnowledge: averageScore,
            problemSolving: averageScore,
            confidence: averageScore,
            professionalism: averageScore
        }
    }
}

function calculateStreakDays(sessions: PracticeSession[]): number {
    // Simplified streak calculation
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const recentSessions = sessions.filter(s =>
        s.startedAt >= yesterday && s.status === "completed"
    )

    return recentSessions.length > 0 ? 1 : 0
}