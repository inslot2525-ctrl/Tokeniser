import API from './api'

export async function optimizePrompt(
  prompt: string,
) {
  const response = await API.post(
    '/optimize',
    {
      prompt,
    },
  )

  return response.data
}