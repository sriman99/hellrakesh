import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Interview } from "@/lib/models/Interview"
import type { Template } from "@/lib/models/Template"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("🔍 Fetching signed URL for company interview ID:", id)

    const db = await getDatabase()
    const interviewsCollection = db.collection<Interview>("interviews")
    const templatesCollection = db.collection<Template>("templates")

    // Find the company interview by uniqueLink
    const interview = await interviewsCollection.findOne({ uniqueLink: id })

    if (!interview) {
      console.log("❌ Company interview not found with ID:", id)
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    console.log("📋 Found company interview:", interview.candidateName)

    // Get the template
    const template = await templatesCollection.findOne({ _id: new ObjectId(interview.templateId) })

    if (!template) {
      console.log("❌ Template not found with ID:", interview.templateId)
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    console.log("📋 Fetched template:", template ? `${template.title} (agentId: ${template.agentId})` : "NOT FOUND")

    if (!template.agentId) {
      console.log("❌ Template has no agentId:", template.title)
      return NextResponse.json({
        error: "No ElevenLabs agent found for this template. Please recreate the template through the web interface to create an agent."
      }, { status: 404 })
    }

    console.log(`🤖 Requesting signed URL for company interview using agent:`, template.agentId)

    // Fetch the signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${template.agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": process.env.XI_API_KEY!,
        },
      }
    )

    console.log("🔌 ElevenLabs API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("❌ ElevenLabs API error:", errorText)
      return NextResponse.json({ error: "Failed to fetch signed URL" }, { status: 500 })
    }

    const body = await response.json()
    console.log(`✅ Signed URL generated successfully for company interview`)
    return NextResponse.json({ signedUrl: body.signed_url })
  } catch (error) {
    console.error("❌ Error fetching signed URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
