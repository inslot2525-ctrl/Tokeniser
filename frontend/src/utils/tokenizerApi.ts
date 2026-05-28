import API from './api'

export async function getTokenCount(
  prompt: string,
) {
  const response = await API.post(
    '/tokenize',
    {
      prompt,
    },
  )

  return response.data.tokens
}