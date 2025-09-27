import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const audioUrl = request.nextUrl.searchParams.get('url');

    if (!audioUrl) {
      console.error("❌ PROXY: No URL provided");
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    console.log("🔄 PROXY: Fetching ElevenLabs audio:", {
      url: audioUrl.substring(0, 100) + "...",
      fullLength: audioUrl.length,
      isElevenLabs: audioUrl.includes('elevenlabs.io')
    });

    // Enhanced headers for better compatibility with ElevenLabs
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'audio/mpeg, audio/ogg, audio/wav, audio/*;q=0.9, */*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    // Add Referer for ElevenLabs if needed
    if (audioUrl.includes('elevenlabs.io')) {
      fetchHeaders['Referer'] = 'https://elevenlabs.io/';
      fetchHeaders['Origin'] = 'https://elevenlabs.io';
    }

    // Fetch the audio from ElevenLabs with enhanced options
    const response = await fetch(audioUrl, {
      method: 'GET',
      headers: fetchHeaders,
      // Add timeout and other options
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log("📊 PROXY: Fetch response:", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      console.error("❌ PROXY: Failed to fetch audio:", response.status, response.statusText);

      // Try to get response body for more details
      let errorDetails = '';
      try {
        const errorText = await response.text();
        errorDetails = errorText.substring(0, 200);
      } catch (e) {
        errorDetails = 'Could not read error response';
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorDetails}`);
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'audio/mpeg';

    console.log("✅ PROXY: Audio fetched successfully:", {
      size: audioBuffer.byteLength + " bytes",
      sizeMB: (audioBuffer.byteLength / 1024 / 1024).toFixed(2) + " MB",
      contentType: contentType,
      isValidSize: audioBuffer.byteLength > 0
    });

    // Validate audio data
    if (audioBuffer.byteLength === 0) {
      throw new Error("Received empty audio data");
    }

    // Return with comprehensive CORS headers for browser access
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
        'Cache-Control': 'public, max-age=3600, immutable',
        'Content-Length': audioBuffer.byteLength.toString(),
        // Additional headers for better compatibility
        'X-Content-Type-Options': 'nosniff',
        'Accept-Ranges': 'bytes',
      }
    });

  } catch (error) {
    const errorObj = error as Error;
    console.error("❌ PROXY: Critical error:", {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack?.substring(0, 500)
    });

    return NextResponse.json({
      error: "Failed to proxy audio",
      details: errorObj.message,
      type: errorObj.name
    }, { status: 500 });
  }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}