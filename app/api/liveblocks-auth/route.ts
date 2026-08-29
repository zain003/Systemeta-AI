import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { Liveblocks } from "@liveblocks/node"

import { hasProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access"

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
}

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
})

export async function POST(request: Request) {
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as { room: string }
  const { room } = body

  if (!room) {
    return NextResponse.json({ error: "Room ID required" }, { status: 400 })
  }

  const { userId, primaryEmail } = await getCurrentClerkIdentity()

  if (!userId || !primaryEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify user has access to this project/room
  const hasAccess = await hasProjectAccess(room, userId, primaryEmail)

  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 })
  }

  try {
    // Create a Liveblocks session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: user.firstName ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}` : "Anonymous",
        avatar: user.imageUrl || "",
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      },
    })

    // Allow this user to enter the room
    session.allow(room, session.FULL_ACCESS)

    // Authorize the user and return the auth token
    const authResult = await session.authorize()

    if (authResult.status !== 200 || !authResult.body) {
      console.error("Liveblocks authorization failed:", authResult.error)
      return NextResponse.json({ error: "Failed to create Liveblocks session" }, { status: 500 })
    }

    const parsedBody = JSON.parse(authResult.body) as { token?: string }

    if (!parsedBody.token) {
      return NextResponse.json({ error: "Liveblocks token missing" }, { status: 500 })
    }

    return NextResponse.json({ token: parsedBody.token })
  } catch (error) {
    console.error("Error generating Liveblocks token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
