import { useEffect, useState } from 'react'

import { getTokenCount } from '../utils/tokenizerApi'

export default function useTokenizer(
  text: string,
) {
  const [tokenCount, setTokenCount] =
    useState(0)

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    if (!text.trim()) {
      setTokenCount(0)
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)

        const count =
          await getTokenCount(text)

        setTokenCount(count)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [text])

  return {
    tokenCount,
    loading,
  }
}