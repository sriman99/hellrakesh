import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { Interview } from "@/lib/models/Interview"
import type { User } from "@/lib/models/User"
import { generateUniqueInterviewLink, getInterviewUrl } from "@/lib/utils/generateLink"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const interviewsCollection = db.collection("interviews")

    let interviews
    if (user.role === "admin") {
      // Admin sees all company interviews (exclude practice sessions)
      interviews = await interviewsCollection.find({
        $or: [
          { "metadata.sessionType": { $ne: "practice" } },
          { "metadata.sessionType": { $exists: false } }
        ]
      }).sort({ createdAt: -1 }).toArray()
    } else {
      // Company users only see their own interviews
      interviews = await interviewsCollection
        .find({
          companyId: new ObjectId(user.userId),
          $or: [
            { "metadata.sessionType": { $ne: "practice" } },
            { "metadata.sessionType": { $exists: false } }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray()
    }

    return NextResponse.json({ interviews })
  } catch (error) {
    console.error("Get interviews error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== COMPANY INTERVIEW API ===')

    const user = await getCurrentUser()
    if (!user) {
      console.log('❌ Authentication failed - no valid user found')
      return NextResponse.json({
        error: "Authentication required. Please log in.",
      }, { status: 401 })
    }

    console.log(`✅ Authenticated user: ${user.email} (${user.role})`)

    const db = await getDatabase()
    const { templateId, candidateName, candidateEmail } = await request.json()
    console.log('📋 Request data:', { templateId, candidateName, candidateEmail })

    // Validate required fields
    if (!templateId || !candidateName || !candidateEmail) {
      console.log('❌ Missing required fields:', {
        templateId: !!templateId,
        candidateName: !!candidateName,
        candidateEmail: !!candidateEmail
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate template exists
    const templatesCollection = db.collection("templates")
    const template = await templatesCollection.findOne({ _id: new ObjectId(templateId) })

    if (!template) {
      console.log(`❌ Template ${templateId} not found`)
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Get user data for quota checking
    const usersCollection = db.collection("users")
    const userData = await usersCollection.findOne({ _id: new ObjectId(user.userId) }) as User | null

    if (!userData) {
      console.log('❌ User data not found in database')
      return NextResponse.json({ error: "User data not found" }, { status: 404 })
    }

    // Check quota limits
    const quotaUsed = userData.interviewsUsed || 0
    const quotaLimit = userData.interviewQuota || 0

    if (quotaUsed >= quotaLimit) {
      console.log(`❌ Interview quota exceeded: ${quotaUsed}/${quotaLimit}`)
      return NextResponse.json({
        error: "Interview quota exceeded. Please contact admin to increase your quota."
      }, { status: 400 })
    }

    // Generate unique interview link
    const uniqueLink = generateUniqueInterviewLink()

    // Create interview
    const newInterview: Omit<Interview, "_id"> = {
      companyId: new ObjectId(user.userId),
      templateId: new ObjectId(templateId),
      candidateName,
      candidateEmail,
      uniqueLink,
      status: "pending",
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        sessionType: 'interview',
        userRole: user.role === 'admin' ? 'admin' : 'company',
        userId: user.userId,
        quotaType: 'interviewsUsed'
      }
    }

    console.log(`🎯 Creating company interview`)

    // Insert interview
    const interviewsCollection = db.collection("interviews")
    const result = await interviewsCollection.insertOne(newInterview)

    // Update quota
    await usersCollection.updateOne(
      { _id: new ObjectId(user.userId) },
      { $inc: { interviewsUsed: 1 } }
    )
    console.log(`📊 Updated company interview quota: ${quotaUsed + 1}/${quotaLimit}`)

    const response = {
      message: "Interview created successfully",
      interview: { ...newInterview, _id: result.insertedId },
      interviewUrl: getInterviewUrl(uniqueLink),
      metadata: {
        sessionType: 'interview',
        userRole: user.role === 'admin' ? 'admin' : 'company',
        quotaUsed: quotaUsed + 1,
        quotaLimit: quotaLimit
      }
    }

    console.log(`✅ Company interview created successfully with ID: ${result.insertedId}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error("❌ Create interview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
