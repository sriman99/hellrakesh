import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Interview } from "@/lib/models/Interview"
import type { Template } from "@/lib/models/Template"
import type { User } from "@/lib/models/User"
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs"
import { join } from "path"
import { pipeline } from "stream"
import { promisify } from "util"
import OpenAI from "openai"
import { uploadAudioToS3 } from "@/lib/utils/s3"

const pipelineAsync = promisify(pipeline)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

async function fetchAndSaveAudio(conversationId: string, retries = 5, delayMs = 10000): Promise<{ localPath: string | null, s3Url: string | null }> {
  const uploadsDir = join(process.cwd(), "uploads")

  // Ensure the uploads directory exists
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir)
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
        {
          method: "GET",
          headers: {
            "xi-api-key": process.env.XI_API_KEY!,
          },
        }
      )

      if (response.ok && response.body) {
        const audioFilePath = join(uploadsDir, `${conversationId}.mp3`)

        // Convert ReadableStream to buffer
        const reader = response.body.getReader()
        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
        }

        // Combine chunks into a single buffer
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const audioBuffer = new Uint8Array(totalLength)
        let offset = 0

        for (const chunk of chunks) {
          audioBuffer.set(chunk, offset)
          offset += chunk.length
        }

        // Save locally first
        const fileStream = createWriteStream(audioFilePath)
        fileStream.write(audioBuffer)
        fileStream.end()

        await new Promise((resolve, reject) => {
          fileStream.on('finish', resolve)
          fileStream.on('error', reject)
        })

        console.log(`Audio file saved locally on attempt ${attempt} at ${audioFilePath}`)

        // Upload to S3
        let s3Url: string | null = null
        try {
          console.log(`🎵 Starting audio S3 upload for file: ${conversationId}.mp3`)
          console.log(`📁 Buffer size: ${audioBuffer.length} bytes`)
          s3Url = await uploadAudioToS3(audioBuffer, `${conversationId}.mp3`)
          console.log(`✅ Audio uploaded to S3 successfully: ${s3Url}`)
        } catch (s3Error) {
          console.error("❌ Failed to upload audio to S3:", s3Error)
          console.error("S3 Error details:", JSON.stringify(s3Error, null, 2))
        }

        return { localPath: audioFilePath, s3Url }
      }

      const errorData = await response.json()
      console.error(`Attempt ${attempt}: Failed to fetch audio file:`, errorData)

      if (errorData.detail?.status !== "missing_conversation_audio") {
        break // Stop retrying for non-recoverable errors
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching audio file:`, error)
    }

    if (attempt < retries) {
      console.log(`Retrying to fetch audio file in ${delayMs / 1000} seconds...`)
      await delay(delayMs) // Wait before retrying
    }
  }

  console.error("Exhausted all retry attempts to fetch audio file.")
  return { localPath: null, s3Url: null }
}

async function fetchTranscript(conversationId: string, retries = 5, delayMs = 10000): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": process.env.XI_API_KEY!,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log(`Transcript fetched successfully on attempt ${attempt}`)
        return data.transcript || null
      }

      const errorData = await response.json()
      console.error(`Attempt ${attempt}: Failed to fetch transcript:`, errorData)

      if (errorData.detail?.status !== "missing_conversation_audio") {
        break // Stop retrying for non-recoverable errors
      }
    } catch (error) {
      console.error(`Attempt ${attempt}: Error fetching transcript:`, error)
    }

    if (attempt < retries) {
      console.log(`Retrying to fetch transcript in ${delayMs / 1000} seconds...`)
      await delay(delayMs) // Wait before retrying
    }
  }

  console.error("Exhausted all retry attempts to fetch transcript.")
  return null
}

async function deleteConversation(conversationId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        method: "DELETE",
        headers: {
          "xi-api-key": process.env.XI_API_KEY!,
        },
      }
    )

    if (response.ok) {
      console.log(`Conversation ${conversationId} deleted successfully.`)
      return true
    }

    const errorData = await response.json()
    console.error(`Failed to delete conversation ${conversationId}:`, errorData)
    return false
  } catch (error) {
    console.error(`Error deleting conversation ${conversationId}:`, error)
    return false
  }
}

// Utility: Calculate local metrics
function calculateLocalMetrics(transcripts: { role: string; message: string }[]) {
  const userMessages = transcripts.filter((t) => t.role === "user")

  const totalWords = userMessages.reduce((sum, msg) => sum + msg.message.split(/\s+/).length, 0)
  const avgWords = totalWords / (userMessages.length || 1)

  const uniqueWords = new Set(userMessages.flatMap((m) => m.message.toLowerCase().split(/\s+/)))
  const vocabRichness = (uniqueWords.size / (totalWords || 1)) * 100

  // Placeholder clarity: assume 100% for demo
  const clarity = 100

  // Placeholder latency: avg seconds between agent question & user reply
  const avgLatency = "2.5s"

  return {
    avgLatency,
    avgWords: avgWords.toFixed(1),
    vocabRichness: vocabRichness.toFixed(1) + "%",
    clarity: clarity.toFixed(1) + "%",
  }
}

// Utility: Calculate final score
function calculateFinalScore(localMetrics: any, aiMetrics: any) {
  // If LLM response has "scores" nested, unwrap it
  const scores = aiMetrics.scores || aiMetrics;

  const localScore =
    (parseFloat(localMetrics.avgWords) +
      parseFloat(localMetrics.vocabRichness) / 10 +
      parseFloat(localMetrics.clarity)) / 3;

  const aiScore =
    (scores.correctness +
      scores.relevance +
      scores.completeness +
      scores.confidence +
      scores.professionalism) / 5;

  return Math.round(0.4 * localScore + 0.6 * aiScore);
}


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const interviewsCollection = db.collection("interviews")
    const templatesCollection = db.collection("templates")
    const usersCollection = db.collection("users")

    console.log(`🔍 Fetching interview with ID: ${id}`)

    // Try to find interview by uniqueLink first, then by ObjectId
    let interview
    try {
      // First try as uniqueLink (for regular interviews)
      interview = await interviewsCollection.findOne({ uniqueLink: id })
      console.log(`📄 Found by uniqueLink:`, !!interview)

      if (!interview) {
        // Then try as ObjectId
        const { ObjectId } = require('mongodb')
        interview = await interviewsCollection.findOne({ _id: new ObjectId(id) })
        console.log(`📄 Found by ObjectId:`, !!interview)
      }
    } catch (error) {
      console.log(`❌ Error looking up interview: ${error}`)
      // If ObjectId parsing fails, interview will remain null
    }

    if (!interview) {
      console.log(`❌ Interview not found with ID: ${id}`)
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    console.log(`✅ Interview found:`, {
      id: interview._id,
      candidateName: interview.candidateName,
      templateId: interview.templateId,
      status: interview.status,
      sessionType: interview.metadata?.sessionType
    })

    // Check if the interview is already completed
    if (interview.status === "completed") {
      return NextResponse.json({ error: "This interview has already been completed." }, { status: 400 })
    }

    // Get template
    const template = await templatesCollection.findOne({ _id: interview.templateId })
    if (!template) {
      console.log(`❌ Template not found with ID: ${interview.templateId}`)
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    console.log(`✅ Template found: ${template.title}`)

    // Get company/user info for companyName
    let companyName = "Unknown Company"
    try {
      // Regular company interview
      const company = await usersCollection.findOne({ _id: interview.companyId })
      if (company) {
        companyName = company.companyName || company.firstName || "Company"
        console.log(`🏢 Company found: ${companyName}`)
      }
    } catch (error) {
      console.log(`⚠️ Error fetching company info: ${error}`)
    }

    // Include analysis and finalScore in the response
    const response = {
      interview,
      template,
      companyName,
      analysis: interview.analysis,
      finalScore: interview.finalScore
    }

    console.log(`✅ Sending interview data for: ${interview.candidateName}`)
    return NextResponse.json(response)
  } catch (error) {
    console.error("Get interview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, responses, score, conversationId } = await request.json()

    const db = await getDatabase()
    const interviewsCollection = db.collection("interviews")
    const usersCollection = db.collection("users")
    const studentsCollection = db.collection("students")

    console.log(`🔄 Updating interview with ID: ${id}, status: ${status}`)

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) updateData.status = status
    if (responses) updateData.responses = responses
    if (score !== undefined) updateData.score = score
    if (conversationId) {
      updateData.conversationId = conversationId

      // Fetch and save audio file
      console.log(`Fetching audio for conversation ID: ${conversationId}`)
      const audioResult = await fetchAndSaveAudio(conversationId)
      if (audioResult.localPath) {
        console.log(`Audio file saved locally at: ${audioResult.localPath}`)
        updateData.audio = audioResult.localPath

        if (audioResult.s3Url) {
          console.log(`Audio file saved to S3 at: ${audioResult.s3Url}`)
          updateData.audioS3 = audioResult.s3Url
        }
      } else {
        console.error(`Failed to fetch audio for conversation ID: ${conversationId}`)
      }

      // Fetch transcript with retries
      const transcript = await fetchTranscript(conversationId)
      if (transcript) {
        updateData.transcript = transcript

        // Ensure the transcript is parsed correctly
        let parsedTranscript
        try {
          if (typeof transcript === "string") {
            parsedTranscript = JSON.parse(transcript)
          } else if (Array.isArray(transcript)) {
            parsedTranscript = transcript
          } else {
            throw new Error("Invalid transcript format")
          }
        } catch (error) {
          console.error("Error parsing transcript:", error)
          throw new Error("Invalid transcript format")
        }

        // Step 1: Calculate local metrics
        console.log("Calculating local metrics...")
        const localMetrics = calculateLocalMetrics(parsedTranscript)
        console.log("Local metrics calculated:", localMetrics)

        // Step 2: Query LLM for subjective metrics
        console.log("Querying LLM for subjective metrics...")
        const prompt = `
You are an interview evaluator. Analyze the following candidate transcript:

${JSON.stringify(parsedTranscript, null, 2)}

Provide scores (1–10) for:
- correctness
- relevance
- completeness
- confidence
- professionalism

Then give a final recommendation: Hire / Maybe / Reject.
Respond in JSON.
        `
        const llmResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: prompt }],
          temperature: 0,
        })

        let aiMetrics
        try {
          const llmContent = llmResponse.choices[0].message?.content || ""
          // Remove any unexpected characters (e.g., backticks) from the response
          const sanitizedContent = llmContent.replace(/```json|```/g, "").trim()
          aiMetrics = JSON.parse(sanitizedContent)
          // After JSON.parse of LLM response
          if (aiMetrics.scores) {
            aiMetrics = { ...aiMetrics.scores, recommendation: aiMetrics.recommendation };
          }

          console.log("LLM metrics received:", aiMetrics)
        } catch (error) {
          console.error("Error parsing LLM response:", error)
          throw new Error("Invalid LLM response format")
        }

        // Step 3: Calculate final score
        console.log("Calculating final score...")
        const finalScore = calculateFinalScore(localMetrics, aiMetrics)
        console.log("Final score calculated:", finalScore)

        // Update analysis and final score
        updateData.analysis = {
          localMetrics,
          aiMetrics,
        }
        updateData.finalScore = {
          score: finalScore,
          breakdown: {
            ...localMetrics,
            ...aiMetrics,
          },
          interpretation: aiMetrics.recommendation,
        }
      }

      // Delete the conversation from ElevenLabs
      console.log(`Deleting conversation ID: ${conversationId}`)
      const isDeleted = await deleteConversation(conversationId)
      if (isDeleted) {
        console.log(`Conversation ${conversationId} successfully deleted from ElevenLabs.`)
      } else {
        console.error(`Failed to delete conversation ${conversationId} from ElevenLabs.`)
      }
    }

    // Find the interview first to check if it's a student practice session
    let interview
    try {
      // First try as uniqueLink
      interview = await interviewsCollection.findOne({ uniqueLink: id })
      if (!interview) {
        // Then try as ObjectId
        const { ObjectId } = require('mongodb')
        interview = await interviewsCollection.findOne({ _id: new ObjectId(id) })
      }
    } catch (error) {
      console.log(`Error finding interview for update: ${error}`)
    }

    if (status === "completed") {
      updateData.completedAt = new Date()

      if (interview) {
        const isStudentPractice = interview.isStudentPractice || interview.metadata?.sessionType === 'practice'

        if (isStudentPractice) {
          // For student practice, update student's practiceUsed count
          await studentsCollection.updateOne(
            { _id: interview.companyId }, // companyId is actually studentId for practice sessions
            {
              $inc: {
                practiceUsed: 1, // Increase used count (quota was already incremented during creation)
              },
            }
          )
          console.log(`📊 Updated student practice completion count`)
        } else {
          // For company interviews, update company's interview quota
          await usersCollection.updateOne(
            { _id: interview.companyId },
            {
              $inc: {
                interviewQuota: -1, // Reduce the quota by 1
                interviewsUsed: 1,  // Increase the used count by 1
              },
            }
          )
          console.log(`📊 Updated company interview quota`)
        }
      }
    }
    if (status === "in-progress" && !updateData.startedAt) updateData.startedAt = new Date()

    // Update by uniqueLink first, then by ObjectId if not found
    let result
    try {
      result = await interviewsCollection.updateOne({ uniqueLink: id }, { $set: updateData })
      if (result.matchedCount === 0) {
        // Try updating by ObjectId
        const { ObjectId } = require('mongodb')
        result = await interviewsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
      }
    } catch (error) {
      console.error(`Error updating interview: ${error}`)
      return NextResponse.json({ error: "Failed to update interview" }, { status: 500 })
    }

    // If nothing was matched, return 404
    if (result.matchedCount === 0) {
      console.error(`No interview found to update for ID: ${id}`)
      return NextResponse.json({ error: "Interview not found for update" }, { status: 404 })
    }

    // Fetch the updated interview document
    let updatedInterview
    try {
      updatedInterview = await interviewsCollection.findOne({ uniqueLink: id })
      if (!updatedInterview) {
        const { ObjectId } = require('mongodb')
        updatedInterview = await interviewsCollection.findOne({ _id: new ObjectId(id) })
      }
    } catch (error) {
      console.log(`Error fetching updated interview: ${error}`)
    }

    console.log(`✅ Interview updated successfully: ${id}`)
    return NextResponse.json(
      {
        success: true,
        message: "Interview updated successfully",
        updatedInterview,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Patch interview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
