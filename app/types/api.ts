export interface APIResponse {
  id: string
  type: string
  role: string
  model: string
  content: {
    type: string
    text: string
  }[]
}
