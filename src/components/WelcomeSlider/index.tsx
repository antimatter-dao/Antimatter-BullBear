import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { GradientCard } from 'components/Card'
import { StyledDialogOverlay, StyledDialogContent } from 'components/Modal'
import { CloseIcon, TYPE } from 'theme'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ButtonWhite } from 'components/Button'
import { AutoColumn } from 'components/Column'
import useTheme from 'hooks/useTheme'
// import { useOnClickOutside } from 'hooks/useOnClickOutside'
// import { useActiveWeb3React } from 'hooks'

const WelcomeCard = styled(GradientCard)``

function List({ list }: { list: string[] }) {
  return (
    <ul style={{ padding: 0 }}>
      <AutoColumn gap="12px">
        {list.map((item, idx) => (
          <li key={item} style={{ listStyle: 'none' }}>
            <RowFixed>
              <AutoRow
                justify="center"
                style={{
                  width: '24px',
                  height: '24px',
                  border: '1px solid #FFFFFF',
                  borderRadius: '50%',
                  marginRight: '24px',
                  textAlign: 'center'
                }}
              >
                {idx}
              </AutoRow>
              <div>{item}</div>
            </RowFixed>
          </li>
        ))}
      </AutoColumn>
    </ul>
  )
}

const pageContent = [
  {
    title: 'Welcome to AntiMatter',
    content:
      'Antimatter is a simple light weight onchain defi derivative protocol. You can now trade and conduct market strategies for onchain perpetual options.'
  },
  {
    title: 'What is option? ',
    content:
      'An option is a contract giving the buyer the right, but not the obligation, to buy (in the case of a call option contract) or sell (in the case of a put option contract) the underlying asset at a specific price on or before a certain date. Traders can use on-chain options for speculation or to hedge their positions. Options are known as derivatives because they derive their value from an underlying asset.\n\nIn short, if you are bullish, buy call option tokens, if you are bearish, buy put option tokens.'
  },
  {
    title: 'Antimatter option feature',
    content: (
      <List
        list={[
          'Each option has a pair of tokens: call token and put token',
          'No liquidation',
          'Perpetual option, no expiry time',
          'Free Funding fee '
        ]}
      />
    )
  },
  {
    title: 'Option Market',
    content:
      'You can buy and sell call and put tokens in the option market page. The experience is same as if you trade tokens on uniswap.'
  },
  {
    title: 'Market Strategy',
    content:
      'You can generate and redeem call and put tokens in this section. In addition, you can provide liquidity to the call and put tokens through market strategy.'
  }
]

export default function WelcomeSlider() {
  // const { account } = useActiveWeb3React()
  const [isOpen, setIsOpen] = useState<boolean>(!(window && window.localStorage.getItem('visited')))
  const [page, setPage] = useState(0)
  const isEndPage = page === pageContent.length - 1
  // const node = useRef<HTMLDivElement>()
  const theme = useTheme()
  // useOnClickOutside(node, () => setIsOpen(false))
  useEffect(() => {
    window && window.localStorage.setItem('visited', 'true')
  }, [])
  const handleNextClick = () => {
    return page < pageContent.length - 1 ? setPage(page + 1) : setIsOpen(false)
  }
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen])
  // useEffect(() => {
  //   console.log(account)
  //   if (account) {
  //     setIsOpen(false)
  //   } else {
  //     setIsOpen(true)
  //   }
  // }, [account])

  return (
    <StyledDialogOverlay
      isOpen={isOpen}
      style={{ alignItems: 'flex-end', justifyContent: 'flex-start', padding: '30px' }}
    >
      <StyledDialogContent
        minHeight={20}
        minWidth={580}
        border={'1px solid ' + theme.bg4}
        style={{ alignSelf: 'unset' }}
      >
        <WelcomeCard>
          <AutoColumn gap="20px" style={{ padding: '12px 24px' }}>
            <RowBetween>
              <TYPE.body fontSize={22}>{pageContent[page].title}</TYPE.body>
              <CloseIcon onClick={handleClose} />
            </RowBetween>
            <TYPE.body style={{ whiteSpace: 'pre-wrap' }}>{pageContent[page].content}</TYPE.body>
            <RowFixed style={{ marginTop: '20px' }}>
              {!isEndPage && (
                <ButtonWhite style={{ padding: '9px', marginRight: '20px', width: '160px' }} onClick={handleClose}>
                  <TYPE.main fontSize={14}>Skip </TYPE.main>
                </ButtonWhite>
              )}
              <ButtonWhite
                style={{ padding: '9px', backgroundColor: '#FFFFFF', width: '160px' }}
                onClick={handleNextClick}
              >
                <TYPE.main fontSize={14} color="#000000">
                  {!isEndPage && (page === 0 ? 'Show Tutorial' : 'Next')}
                  {isEndPage && 'Begin to trade'}
                </TYPE.main>
              </ButtonWhite>
            </RowFixed>
          </AutoColumn>
        </WelcomeCard>
      </StyledDialogContent>
    </StyledDialogOverlay>
  )
}
