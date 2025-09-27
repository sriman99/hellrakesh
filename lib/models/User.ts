import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  role: "admin" | "company"
  name: string
  companyName?: string
  interviewQuota?: number
  interviewsUsed?: number
  createdAt: Date
  updatedAt: Date
}

export interface Company extends User {
  role: "company"
  companyName: string
  interviewQuota: number
  interviewsUsed: number
}

export interface Admin extends User {
  role: "admin"
}
