import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const STUDENT_COOKIE_NAME = "student-auth-token"

export interface StudentJWTPayload {
    studentId: string
    email: string
    firstName: string
    lastName: string
    subscriptionTier: "free" | "premium" | "pro"
    accountStatus: "active" | "suspended" | "pending_verification"
    practiceQuota: number
    practiceUsed: number
}

export interface StudentAuthResult {
    success: boolean
    student?: StudentJWTPayload
    token?: string
    error?: string
}

export interface PasswordValidation {
    isValid: boolean
    errors: string[]
}

export interface EmailValidation {
    isValid: boolean
    error?: string
}

// Password utilities
export async function hashStudentPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
}

export async function verifyStudentPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// Token utilities
export function generateStudentToken(payload: StudentJWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "30d", // Students get longer sessions
        issuer: "humaneq-hr-student",
        audience: "student"
    })
}

export function verifyStudentToken(token: string): StudentJWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: "humaneq-hr-student",
            audience: "student"
        }) as StudentJWTPayload
        return decoded
    } catch (error) {
        console.error("Token verification failed:", error)
        return null
    }
}

// Cookie management
export async function setStudentAuthCookie(token: string, rememberMe: boolean = false) {
    const cookieStore = await cookies()
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7 // 30 days or 7 days

    cookieStore.set(STUDENT_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
    })
}

export async function getStudentAuthToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(STUDENT_COOKIE_NAME)?.value || null
}

export async function removeStudentAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete(STUDENT_COOKIE_NAME)
}

export async function getCurrentStudent(): Promise<StudentJWTPayload | null> {
    const token = await getStudentAuthToken()
    if (!token) return null
    return verifyStudentToken(token)
}

// Validation utilities
export function validateStudentPassword(password: string): PasswordValidation {
    const errors: string[] = []

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long")
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter")
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter")
    }

    if (!/\d/.test(password)) {
        errors.push("Password must contain at least one number")
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character")
    }

    if (password.length > 128) {
        errors.push("Password must be less than 128 characters")
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export function validateStudentEmail(email: string): EmailValidation {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
        return { isValid: false, error: "Email is required" }
    }

    if (!emailRegex.test(email)) {
        return { isValid: false, error: "Invalid email format" }
    }

    if (email.length > 254) {
        return { isValid: false, error: "Email is too long" }
    }

    return { isValid: true }
}

// Security utilities
export function generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex")
}

export function generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString("hex")
}

export function generateSecureSessionId(): string {
    return crypto.randomBytes(16).toString("hex")
}

// Rate limiting utilities
export interface RateLimitResult {
    allowed: boolean
    remainingAttempts?: number
    resetTime?: Date
}

const loginAttempts = new Map<string, { count: number; resetTime: Date }>()

export function checkLoginRateLimit(email: string): RateLimitResult {
    const maxAttempts = 5
    const windowMinutes = 15
    const now = new Date()

    const attempts = loginAttempts.get(email)

    if (!attempts) {
        loginAttempts.set(email, { count: 1, resetTime: new Date(now.getTime() + windowMinutes * 60000) })
        return { allowed: true, remainingAttempts: maxAttempts - 1 }
    }

    if (now > attempts.resetTime) {
        loginAttempts.set(email, { count: 1, resetTime: new Date(now.getTime() + windowMinutes * 60000) })
        return { allowed: true, remainingAttempts: maxAttempts - 1 }
    }

    if (attempts.count >= maxAttempts) {
        return { allowed: false, resetTime: attempts.resetTime }
    }

    attempts.count++
    return { allowed: true, remainingAttempts: maxAttempts - attempts.count }
}

export function clearLoginRateLimit(email: string): void {
    loginAttempts.delete(email)
}

// Session management
export interface StudentSession {
    studentId: string
    sessionId: string
    createdAt: Date
    lastActivity: Date
    ipAddress?: string
    userAgent?: string
}

const activeSessions = new Map<string, StudentSession>()

export function createStudentSession(studentId: string, ipAddress?: string, userAgent?: string): string {
    const sessionId = generateSecureSessionId()
    const now = new Date()

    activeSessions.set(sessionId, {
        studentId,
        sessionId,
        createdAt: now,
        lastActivity: now,
        ipAddress,
        userAgent
    })

    return sessionId
}

export function updateStudentSessionActivity(sessionId: string): boolean {
    const session = activeSessions.get(sessionId)
    if (!session) return false

    session.lastActivity = new Date()
    return true
}

export function getStudentSession(sessionId: string): StudentSession | null {
    return activeSessions.get(sessionId) || null
}

export function removeStudentSession(sessionId: string): boolean {
    return activeSessions.delete(sessionId)
}

export function cleanupExpiredSessions(): number {
    const now = new Date()
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
    let cleaned = 0

    for (const [sessionId, session] of activeSessions) {
        if (now.getTime() - session.lastActivity.getTime() > maxAge) {
            activeSessions.delete(sessionId)
            cleaned++
        }
    }

    return cleaned
}

// Quota management
export function canPractice(practiceUsed: number, practiceQuota: number): boolean {
    return practiceUsed < practiceQuota
}

export function resetMonthlyQuota(lastResetDate: Date): boolean {
    const now = new Date()
    const nextReset = new Date(lastResetDate)
    nextReset.setMonth(nextReset.getMonth() + 1)

    return now >= nextReset
}