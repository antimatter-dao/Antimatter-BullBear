import React from 'react'
import styled from 'styled-components'
import Helper from 'assets/svg/helper.svg'
import { ExternalLink } from 'theme'

const Feedback = styled(ExternalLink)`
  z-index: 101;
  position: fixed;
  right: 50px;
  bottom: 50px;
  img {
    width: 24px;
    height: 24px;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    right:14px
    bottom: 67px;
    img {
      width: 26px;
      height: 26px;
    }
  `};
`

export default function ButtonFeedback() {
  return (
    <Feedback
      href={
        'https://docs.google.com/forms/d/e/1FAIpQLSfyWq7xlI_ro72-n9rM-disc7extCoVw5oUiOQND7fnh1c80g/viewform?usp=pp_url'
      }
    >
      <img alt="" src={Helper} />
    </Feedback>
  )
}
