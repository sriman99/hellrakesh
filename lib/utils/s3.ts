import { S3Client, PutObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

/**
 * Test AWS connection and bucket access
 */
export async function testS3Connection(): Promise<boolean> {
  try {
    console.log(`🔍 Testing S3 connection...`)
    console.log(`  - Bucket: ${process.env.S3_BUCKET_NAME}`)
    console.log(`  - Region: ${process.env.AWS_REGION}`)
    console.log(`  - Access Key ID: ${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...`)

    const command = new HeadBucketCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
    })

    await s3Client.send(command)
    console.log(`✅ S3 connection test successful!`)
    return true
  } catch (error) {
    console.error("❌ S3 connection test failed:", error)
    return false
  }
}

/**
 * Upload a file to S3 bucket
 * @param file - File buffer or Uint8Array
 * @param key - S3 object key (file path)
 * @param contentType - MIME type of the file
 * @returns Promise<string> - S3 URL of uploaded file
 */
export async function uploadToS3(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<string> {
  try {
    console.log(`🚀 Attempting S3 upload:`)
    console.log(`  - Bucket: ${process.env.S3_BUCKET_NAME}`)
    console.log(`  - Region: ${process.env.AWS_REGION}`)
    console.log(`  - Key: ${key}`)
    console.log(`  - Content Type: ${contentType}`)
    console.log(`  - File Size: ${file.length} bytes`)

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ACL removed - bucket has ACLs disabled
    })

    console.log(`📤 Sending S3 command...`)
    const result = await s3Client.send(command)
    console.log(`✅ S3 upload successful:`, result)

    // Return the public S3 URL
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    console.log(`🌐 Generated S3 URL: ${s3Url}`)
    
    return s3Url
  } catch (error) {
    console.error("❌ Error uploading to S3:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    throw new Error(`Failed to upload file to S3: ${error}`)
  }
}

/**
 * Upload video file to S3
 * @param videoBuffer - Video file buffer
 * @param fileName - Name of the video file
 * @returns Promise<string> - S3 URL
 */
export async function uploadVideoToS3(
  videoBuffer: Buffer | Uint8Array,
  fileName: string
): Promise<string> {
  const key = `video/${fileName}`
  return uploadToS3(videoBuffer, key, "video/webm")
}

/**
 * Upload audio file to S3
 * @param audioBuffer - Audio file buffer
 * @param fileName - Name of the audio file
 * @returns Promise<string> - S3 URL
 */
export async function uploadAudioToS3(
  audioBuffer: Buffer | Uint8Array,
  fileName: string
): Promise<string> {
  const key = `audio/${fileName}`
  return uploadToS3(audioBuffer, key, "audio/mpeg")
}

/**
 * Upload file stream to S3 (for larger files)
 * @param stream - Readable stream
 * @param key - S3 object key
 * @param contentType - MIME type
 * @returns Promise<string> - S3 URL
 */
export async function uploadStreamToS3(
  stream: NodeJS.ReadableStream,
  key: string,
  contentType: string
): Promise<string> {
  try {
    // Convert stream to buffer
    const chunks: Uint8Array[] = []
    
    for await (const chunk of stream) {
      if (chunk instanceof Buffer) {
        chunks.push(new Uint8Array(chunk))
      } else if (typeof chunk === 'string') {
        chunks.push(new TextEncoder().encode(chunk))
      } else {
        chunks.push(chunk as Uint8Array)
      }
    }
    
    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }
    
    return uploadToS3(buffer, key, contentType)
  } catch (error) {
    console.error("Error uploading stream to S3:", error)
    throw new Error(`Failed to upload stream to S3: ${error}`)
  }
}
