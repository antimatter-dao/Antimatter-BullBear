import { Dots } from 'components/swap/styleds'
import React from 'react'

export default function ComingSoon() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        fontWeight: 700
      }}
    >
      Coming Soon
      <Dots />
    </div>
  )
}
