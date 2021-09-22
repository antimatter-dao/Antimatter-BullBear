import { useEffect, useState } from 'react'
import { MEDIA_WIDTHS } from '../theme'
import { useWindowSize } from './useWindowSize'

export default function useMediaWidth(width: keyof typeof MEDIA_WIDTHS) {
  const [isUpTo, setIsUpTo] = useState(false)
  const windowSize = useWindowSize()

  useEffect(() => {
    if (windowSize.width && windowSize.width >= MEDIA_WIDTHS[width]) {
      setIsUpTo(false)
    } else {
      setIsUpTo(true)
    }
  }, [windowSize, width])

  return isUpTo
}
