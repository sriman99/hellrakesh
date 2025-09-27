import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt provided." }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an assistant that generates interview questions." },
        { role: "user", content: `Generate a list of interview questions based on the following prompt: ${prompt}` },
      ],
      max_tokens: 500,
    })

    const content = response.choices[0].message?.content || ""
    const questions = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions." }, { status: 500 })
  }
}
