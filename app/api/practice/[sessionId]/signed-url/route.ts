import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentStudent } from "@/lib/utils/studentAuth"
import type { Template } from "@/lib/models/Template"
import type { Student } from "@/lib/models/Student"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { sessionId } = await params
        console.log("🔍 Fetching signed URL for practice session:", sessionId)

        // Authenticate student
        const currentStudent = await getCurrentStudent()
        if (!currentStudent) {
            return NextResponse.json({ error: "Student authentication required" }, { status: 401 })
        }

        const db = await getDatabase()
        const templatesCollection = db.collection<Template>("templates")
        const practiceSessionsCollection = db.collection("practice_sessions")

        // Find practice session by sessionId
        const session = await practiceSessionsCollection.findOne({
            sessionId: sessionId,
            studentEmail: currentStudent.email
        })

        if (!session) {
            console.log("❌ Practice session not found for student:", currentStudent.email)
            return NextResponse.json({ error: "Practice session not found" }, { status: 404 })
        }

        console.log("📋 Found practice session:", session.templateTitle)

        // Get template for the practice session
        const template = await templatesCollection.findOne({ _id: new ObjectId(session.templateId) })
        console.log("📋 Fetched template:", template ? `${template.title} (agentId: ${template.agentId})` : "NOT FOUND")

        if (!template) {
            console.log("❌ Template not found with ID:", session.templateId)
            return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }

        if (!template.agentId) {
            console.log("❌ Template has no agentId:", template.title)
            return NextResponse.json({
                error: "No ElevenLabs agent found for this template. Please recreate the template through the web interface to create an agent."
            }, { status: 404 })
        }

        console.log("🤖 Requesting signed URL for practice session using agent:", template.agentId)
        console.log("📊 AGENT STATUS INFO:")
        console.log(`  - Session ID: ${sessionId}`)
        console.log(`  - Template: ${template.title}`)
        console.log(`  - Agent ID: ${template.agentId}`)
        console.log(`  - Student: ${currentStudent.email}`)
        console.log(`  - Time: ${new Date().toISOString()}`)

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
        console.log("📊 AGENT RESPONSE STATUS:")
        console.log(`  - HTTP Status: ${response.status}`)
        console.log(`  - Status Text: ${response.statusText}`)
        console.log(`  - Agent ID: ${template.agentId}`)
        console.log(`  - Session: ${sessionId}`)

        if (!response.ok) {
            const errorText = await response.text()
            console.log("❌ ElevenLabs API error:", errorText)
            console.log("📊 AGENT ERROR STATUS:")
            console.log(`  - HTTP Status: ${response.status}`)
            console.log(`  - Error: ${errorText}`)
            console.log(`  - Agent ID: ${template.agentId}`)
            console.log(`  - Session: ${sessionId}`)
            return NextResponse.json({ error: "Failed to fetch signed URL" }, { status: 500 })
        }

        const body = await response.json()
        console.log("✅ Signed URL generated successfully for practice session")
        console.log("📊 AGENT SUCCESS STATUS:")
        console.log(`  - HTTP Status: ${response.status}`)
        console.log(`  - Agent ID: ${template.agentId}`)
        console.log(`  - Session: ${sessionId}`)
        console.log(`  - Signed URL Length: ${body.signed_url?.length || 0} characters`)
        return NextResponse.json({ signedUrl: body.signed_url })
    } catch (error) {
        console.error("❌ Error fetching signed URL for practice session:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}