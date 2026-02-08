import { getAuth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { NextRequest, NextResponse } from "next/server"

// Lazy handlers - defer auth initialization until first request
// This allows the app to boot without DATABASE_URL configured

export async function GET(request: NextRequest) {
  try {
    const { GET: handler } = toNextJsHandler(getAuth())
    return handler(request)
  } catch (error) {
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. See ENV_SETUP.md' },
        { status: 503 }
      )
    }
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { POST: handler } = toNextJsHandler(getAuth())
    return handler(request)
  } catch (error) {
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'Database not configured. See ENV_SETUP.md' },
        { status: 503 }
      )
    }
    throw error
  }
}
