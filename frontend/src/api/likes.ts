import client from './client'

export type LikeResponse = {
  liked: boolean
  likes: number
}

export async function toggleLike(projectId: string): Promise<LikeResponse> {
  const response = await client.post<LikeResponse>(`/projects/${projectId}/like`)
  return response.data
}
