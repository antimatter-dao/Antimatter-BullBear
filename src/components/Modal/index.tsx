import React from 'react'
import styled, { css } from 'styled-components'
import { animated, useTransition, useSpring } from 'react-spring'
import { DialogOverlay, DialogContent } from '@reach/dialog'
import { isMobile } from 'react-device-detect'
import '@reach/dialog/styles.css'
import { useGesture } from 'react-use-gesture'
import { transparentize } from 'polished'
import { Marginer } from '../../pages/App'
// import { headerHeightDisplacement } from '../Header'

const AnimatedDialogOverlay = animated(DialogOverlay)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledDialogOverlay = styled(AnimatedDialogOverlay)<{
  color?: string
  overflow?: string
  alignitems?: string
}>`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    overflow: ${({ overflow }) => overflow ?? 'hidden'};
    padding-top: ${({ theme }) => theme.headerHeight}

    display: flex;
    align-items: ${({ alignitems }) => alignitems ?? 'center'};
    justify-content: center;

    background-color: ${({ theme, color }) => color ?? theme.modalBG};
    ${({ theme }) => theme.mediaWidth.upToSmall`
    height: calc(100% - ${theme.headerHeight});
    justify-content: flex-end;
    padding-top: 0
    `}
  }
`
export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  ${({ theme }) => theme.mediaWidth.upToSmall`          
    margin-top: auto;
    max-height: calc(100% - ${theme.mobileHeaderHeight});
    overflow-y: auto;
  `}
`

// export const Filler = styled.div`
//   width: 212px;
//   ${({ theme }) => theme.desktop}
// `

export const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, maxWidth, minWidth, ...rest }) => (
  <AnimatedDialogContent {...rest} />
)).attrs({
  'aria-label': 'dialog'
})`
  overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background: ${({ theme }) => theme.gradient1};
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
    padding: 0px;
    width: 42vw;
    ${({ minWidth }) =>
      minWidth &&
      css`
        min-width: ${minWidth}px;
      `}
    overflow-y: ${({ mobile }) => (mobile ? 'scroll' : 'hidden')};
    overflow-x: hidden;

    align-self: center;

    max-width: 480px;
        ${({ maxWidth }) =>
          maxWidth &&
          css`
            max-width: ${maxWidth}px;
          `}
    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    display: flex;
    border-radius: 42px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100vw;
      max-width:unset;
      border-radius: 20px;
      border-bottom-left-radius: unset;
      border-bottom-right-radius: unset;
      max-height: calc(100% - ${theme.mobileHeaderHeight});
      overflow-y: auto;
      
    `}
  }
`

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  initialFocusRef?: React.RefObject<any>
  children?: React.ReactNode
  maxWidth?: number
}

export default function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  maxWidth = 480,
  initialFocusRef,
  children
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, null, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  })

  const [{ y }, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }))
  const bind = useGesture({
    onDrag: state => {
      set({
        y: state.down ? state.movement[1] : 0
      })
      if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
        onDismiss()
      }
    }
  })

  return (
    <>
      {fadeTransition.map(
        ({ item, key, props }) =>
          item && (
            <StyledDialogOverlay
              key={key}
              style={props}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              unstable_lockFocusAcrossFrames={false}
            >
              {/* <Filler /> */}
              <Wrapper>
                <StyledDialogContent
                  {...(isMobile
                    ? {
                        ...bind(),
                        style: { transform: y.interpolate(y => `translateY(${y > 0 ? y : 0}px)`) }
                      }
                    : {})}
                  aria-label="dialog content"
                  minHeight={minHeight}
                  maxHeight={maxHeight}
                  mobile={isMobile}
                  maxWidth={maxWidth}
                >
                  {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                  {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                  {children}
                </StyledDialogContent>
                <Marginer />
              </Wrapper>
            </StyledDialogOverlay>
          )
      )}
    </>
  )
}
