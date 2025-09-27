import { randomBytes } from "crypto"

export function generateUniqueInterviewLink(): string {
  const randomId = randomBytes(16).toString("hex")
  return `interview-${Date.now()}-${randomId}`
}

export function getInterviewUrl(uniqueLink: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  return `${baseUrl}/interview/${uniqueLink}`
}
