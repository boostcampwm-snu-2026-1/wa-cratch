import client from './client'
import type { Project } from './projects'

export type FollowingUser = {
  id: string
  nickname: string
  avatar: string
  projectCount: number
}

export async function getFollowing(): Promise<FollowingUser[]> {
  const response = await client.get<FollowingUser[]>('/users/me/following')
  return response.data
}

export async function followUser(userId: string): Promise<void> {
  await client.post(`/users/${userId}/follow`)
}

export async function unfollowUser(userId: string): Promise<void> {
  await client.delete(`/users/${userId}/follow`)
}

export async function getLikedProjects(): Promise<Project[]> {
  const response = await client.get<Project[]>('/projects/liked')
  return response.data
}
