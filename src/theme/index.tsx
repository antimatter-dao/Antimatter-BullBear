import { transparentize } from 'polished'
import React, { useMemo } from 'react'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme
} from 'styled-components'
import { useIsDarkMode } from '../state/user/hooks'
import { Text, TextProps } from 'rebass'
import { Colors } from './styled'

export * from './components'

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // text
    text1: darkMode ? '#FFFFFF' : '#000000',
    text2: darkMode ? '#CCCCCC' : '#565A69',
    text3: darkMode ? '#999999' : '#888D9B',
    text4: darkMode ? '#727272' : '#C3C5CB',
    text5: darkMode ? '#333333' : '#EDEEF2',

    // backgrounds / greys
    bg1: darkMode ? '#000000' : '#FFFFFF',
    bg2: darkMode ? '#191919' : '#F7F8FA',
    bg3: darkMode ? '#252525' : '#EDEEF2',
    bg4: darkMode ? '#303030' : '#CED0D9',
    bg5: darkMode ? '#A1A1A1' : '#888D9B',

    //specialty colors
    modalBG: darkMode ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,0.3)',
    advancedBG: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.6)',

    //primary colors
    primary1: darkMode ? '#B2F355' : '#FF007A',
    primary2: darkMode ? '#B2F355' : '#FF8CC3',
    primary3: darkMode ? '#B2F355' : '#FF99C9',
    primary4: darkMode ? '#739A3B' : '#F6DDE8',
    primary5: darkMode ? '#2B3A14' : '#FDEAF1',

    // color text
    primaryText1: darkMode ? '#B2F355' : '#ff007a',

    // secondary colors
    secondary1: darkMode ? '#739A3B' : '#ff007a',
    secondary2: darkMode ? '#191919' : '#F6DDE8',
    secondary3: darkMode ? '#252525' : '#FDEAF1',

    // other
    red1: '#FF0000',
    red2: '#FF2828',
    red3: '#FF4B4B',
    green1: '#24FF00',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    blue1: '#2172E5',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
    translucent: 'rgba(255, 255, 255, 0.08)',
    gradient1:
      '#000000 linear-gradient(283.31deg, rgba(255, 255, 255, 0.18) -2.53%, rgba(255, 255, 255, 0.17) 18.66%, rgba(255, 255, 255, 0) 98.68%)',
    gradient2: '#000000 linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%)'
  }
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24
    },

    //shadows
    shadow1: darkMode ? '#000' : '#2F80ED',

    // media queries
    mediaWidth: mediaWidthTemplates,

    //rwd
    mobile: css`
      display: none;
      ${mediaWidthTemplates.upToSmall`display:inherit;`}
    `,
    desktop: css`
      ${mediaWidthTemplates.upToSmall`display:none;`}
    `,
    mobileHeaderHeight: '90px',
    headerHeight: '82px',

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} {...props} fontFamily="Futura PT" />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={22} {...props} fontFamily="Futura PT" />
  },
  smallHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={16} {...props} fontFamily="Futura PT" />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={14} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={12} {...props} />
  },
  smallGray(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={12} color={'text3'} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow1'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  }
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: 'Roboto', sans-serif;
  font-display: fallback;
}
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: 'Roboto', sans-serif;
  }
}

html,
body {
  margin: 0;
  padding: 0;
}

 a {
   color: ${colors(false).blue1}; 
 }

* {
  box-sizing: border-box;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  
}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg2};
}

body {
  min-height: 100vh;
  background-position: 0 -30vh;
  background-repeat: no-repeat;
  background-image: ${({ theme }) =>
    `radial-gradient(50% 50% at 50% 50%, ${transparentize(0.9, theme.primary1)} 0%, ${transparentize(
      1,
      theme.bg1
    )} 100%)`};
}
`
