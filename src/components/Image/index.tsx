import React, { ImgHTMLAttributes, useMemo, useState } from 'react'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export default function Image({
  src,
  alt = '',
  style,
  className,
  altSrc,
  ...rest
}: {
  src: string
  alt?: string
  style?: React.CSSProperties
  className?: string
  altSrc?: string
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'style'>) {
  const [, refresh] = useState<number>(0)
  const srcs = useMemo(() => [src, altSrc], [src, altSrc])
  const srcStr = srcs.find(item => !BAD_SRCS[item ?? ''])
  return (
    <img
      {...rest}
      src={srcStr}
      alt={alt}
      style={style}
      className={className}
      onError={() => {
        if (srcStr) BAD_SRCS[srcStr] = true
        refresh(i => i + 1)
      }}
    />
  )
}
