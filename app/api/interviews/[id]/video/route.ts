import { type NextRequest, NextResponse } from "next/server"
import { writeFile, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { promisify } from "util"
import { getDatabase } from "@/lib/mongodb"
import type { Interview } from "@/lib/models/Interview"
import { uploadVideoToS3, testS3Connection } from "@/lib/utils/s3"

const writeFileAsync = promisify(writeFile)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const videoFile = formData.get("video") as File
    const recordingType = formData.get("type") as string // "user-only" or "complete"

    if (!videoFile) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "uploads")
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename with timestamp and type
    const timestamp = Date.now()
    const typePrefix = recordingType === "complete" ? "complete" : "user"
    const fileName = `interview_${id}_${typePrefix}_${timestamp}.webm`
    const filePath = join(uploadsDir, fileName)

    // Convert file to buffer and save locally
    const bytes = await videoFile.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    // Save locally (backup)
    await writeFileAsync(filePath, buffer)
    console.log(`${recordingType === "complete" ? "Complete" : "User-only"} video file saved locally at: ${filePath}`)

    // Test S3 connection first
    console.log(`🔧 Testing S3 connection before upload...`)
    const connectionTest = await testS3Connection()
    if (!connectionTest) {
      console.error("❌ S3 connection test failed - skipping S3 upload")
    }

    // Upload to S3 (primary storage)
    let s3Url: string | null = null
    if (connectionTest) {
      try {
        console.log(`🎥 Starting ${recordingType === "complete" ? "complete" : "user-only"} video S3 upload for file: ${fileName}`)
        console.log(`📁 Buffer size: ${buffer.length} bytes`)
        s3Url = await uploadVideoToS3(buffer, fileName)
        console.log(`✅ ${recordingType === "complete" ? "Complete" : "User-only"} video uploaded to S3 successfully: ${s3Url}`)
      } catch (s3Error) {
        console.error("❌ Failed to upload video to S3:", s3Error)
        console.error("S3 Error details:", JSON.stringify(s3Error, null, 2))
        // Continue execution - we have local backup
      }
    }

    // Update the interview record in the database with both paths
    try {
      const db = await getDatabase()
      const interviewsCollection = db.collection<Interview>("interviews")

      const updateData: any = {
        updatedAt: new Date()
      }

      // Set appropriate fields based on recording type
      if (recordingType === "complete") {
        updateData.videoComplete = filePath // Local backup path for complete recording
        if (s3Url) {
          updateData.videoCompleteS3 = s3Url // S3 URL for complete recording
        }
      } else {
        updateData.video = filePath // Local backup path for user-only recording
        if (s3Url) {
          updateData.videoS3 = s3Url // S3 URL for user-only recording
        }
      }

      await interviewsCollection.updateOne(
        { uniqueLink: id },
        { $set: updateData }
      )

      console.log(`Interview record updated with ${recordingType} video paths - Local: ${filePath}${s3Url ? `, S3: ${s3Url}` : ''}`)
    } catch (dbError) {
      console.error("Error updating interview record:", dbError)
      // Continue execution as files were saved successfully
    }

    return NextResponse.json({
      success: true,
      message: `${recordingType === "complete" ? "Complete" : "User-only"} video uploaded successfully`,
      localPath: filePath,
      s3Url: s3Url,
      fileName: fileName,
      recordingType: recordingType,
      storage: s3Url ? "dual" : "local-only"
    })
  } catch (error) {
    console.error("Video upload error:", error)
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 })
  }
}
