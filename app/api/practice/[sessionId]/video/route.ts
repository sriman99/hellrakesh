import { type NextRequest, NextResponse } from "next/server"
import { writeFile, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { promisify } from "util"
import { getDatabase } from "@/lib/mongodb"
import type { PracticeSession } from "@/lib/models/Student"
import { uploadToS3, testS3Connection } from "@/lib/utils/s3"

const writeFileAsync = promisify(writeFile)

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { sessionId } = await params
        const formData = await request.formData()
        const videoFile = formData.get("video") as File
        const recordingType = formData.get("type") as string // "candidate", "system", or "complete"

        if (!videoFile) {
            return NextResponse.json({ error: "No video file provided" }, { status: 400 })
        }

        console.log(`🎓 Processing student practice video upload:`)
        console.log(`  - Session ID: ${sessionId}`)
        console.log(`  - Recording Type: ${recordingType}`)
        console.log(`  - File Size: ${videoFile.size} bytes`)

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "uploads")
        if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true })
        }

        // Generate unique filename with timestamp and type
        const timestamp = Date.now()
        const typePrefix = recordingType || "complete"
        const fileName = `practice_${sessionId}_${typePrefix}_${timestamp}.webm`
        const filePath = join(uploadsDir, fileName)

        // Convert file to buffer and save locally
        const bytes = await videoFile.arrayBuffer()
        const buffer = new Uint8Array(bytes)

        // Save locally (backup)
        await writeFileAsync(filePath, buffer)
        console.log(`✅ Student practice video saved locally: ${filePath}`)

        // Test S3 connection first
        console.log(`🔧 Testing S3 connection for student practice upload...`)
        const connectionTest = await testS3Connection()
        if (!connectionTest) {
            console.error("❌ S3 connection test failed - skipping S3 upload")
        }

        // Upload to S3 in student-specific folder structure
        let s3Url: string | null = null
        if (connectionTest) {
            try {
                console.log(`🎥 Starting student practice video S3 upload...`)

                // Student-specific S3 key structure: student/video/practice_sessionId_type_timestamp.webm
                const s3Key = `student/video/${fileName}`
                console.log(`📁 S3 Key: ${s3Key}`)

                s3Url = await uploadToS3(buffer, s3Key, "video/webm")
                console.log(`✅ Student practice video uploaded to S3: ${s3Url}`)
            } catch (s3Error) {
                console.error("❌ Failed to upload student practice video to S3:", s3Error)
                console.error("S3 Error details:", JSON.stringify(s3Error, null, 2))
                // Continue execution - we have local backup
            }
        }

        // Update the practice session record in the database
        try {
            const db = await getDatabase()
            const practiceSessionsCollection = db.collection<PracticeSession>("practiceSessions")

            const updateData: any = {
                updatedAt: new Date()
            }

            // Set appropriate fields based on recording type
            if (recordingType === "complete") {
                updateData.videoComplete = filePath
                if (s3Url) {
                    updateData.videoCompleteS3 = s3Url
                }
            } else if (recordingType === "candidate") {
                updateData.videoCandidate = filePath
                if (s3Url) {
                    updateData.videoCandidateS3 = s3Url
                }
            } else if (recordingType === "system") {
                updateData.videoSystem = filePath
                if (s3Url) {
                    updateData.videoSystemS3 = s3Url
                }
            } else {
                // Default to complete recording
                updateData.video = filePath
                if (s3Url) {
                    updateData.videoS3 = s3Url
                }
            }

            await practiceSessionsCollection.updateOne(
                { sessionId: sessionId },
                { $set: updateData }
            )

            console.log(`✅ Practice session updated with ${recordingType} video paths`)
            console.log(`  - Local: ${filePath}`)
            if (s3Url) console.log(`  - S3: ${s3Url}`)
        } catch (dbError) {
            console.error("❌ Error updating practice session record:", dbError)
            // Continue execution as files were saved successfully
        }

        return NextResponse.json({
            success: true,
            message: `Student practice ${recordingType} video uploaded successfully`,
            localPath: filePath,
            s3Url: s3Url,
            fileName: fileName,
            recordingType: recordingType,
            storage: s3Url ? "dual" : "local-only",
            sessionId: sessionId
        })
    } catch (error) {
        console.error("❌ Student practice video upload error:", error)
        return NextResponse.json({ error: "Failed to upload student practice video" }, { status: 500 })
    }
}