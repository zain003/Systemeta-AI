import { currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

export async function getCurrentClerkIdentity() {
  const user = await currentUser()

  if (!user) {
    return {
      userId: null,
      primaryEmail: null,
    }
  }

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null

  return {
    userId: user.id,
    primaryEmail,
  }
}

export async function hasProjectAccess(projectId: string, userId: string | null, primaryEmail: string | null) {
  if (!userId || !primaryEmail) {
    return false
  }

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      collaborators: true,
    },
  })

  if (!project) {
    return false
  }

  const normalizedUserEmail = primaryEmail.toLowerCase()

  return (
    project.ownerId === userId ||
    project.collaborators.some(
      (collaborator) => collaborator.collaboratorEmail.toLowerCase() === normalizedUserEmail,
    )
  )
}

export async function getAccessibleProjects(userId: string, primaryEmail: string) {
  const normalizedEmail = primaryEmail.toLowerCase()

  return prisma.project.findMany({
    where: {
      OR: [
        {
          ownerId: userId,
        },
        {
          collaborators: {
            some: {
              collaboratorEmail: {
                equals: normalizedEmail,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
