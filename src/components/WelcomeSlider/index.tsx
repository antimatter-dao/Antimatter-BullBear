import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { GradientCard } from 'components/Card'
import { StyledDialogOverlay, StyledDialogContent } from 'components/Modal'
import { CloseIcon, TYPE } from 'theme'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { ButtonWhite } from 'components/Button'
import { AutoColumn } from 'components/Column'
import useTheme from 'hooks/useTheme'
import useMediaWidth from 'hooks/useMediaWidth'
// import { useOnClickOutside } from 'hooks/useOnClickOutside'
// import { useActiveWeb3React } from 'hooks'

const WelcomeCard = styled(GradientCard)`
  width: 580px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: auto;
  `}
`

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
    title: 'Welcome to Antimatter',
    content:
      'Understand Antimatter in one minute \n' +
      '\n' +
      'What Antimatter creates is decentralized Bull and Bear tokens, which are leverage embedded and non-expiry.\n' +
      '\n' +
      'The bull token price will increase more than the underlying target asset when there is a price appreciation of.\n' +
      '\n' +
      'The bear token price will act in reverse to underlying target asset. When the underlying target asset increases in price, the bear tokens price will decrease.\n' +
      '\n' +
      'It is simple as it is, leveraged tokens.\n' +
      '\n' +
      'Bullish and want to have more price exposure? Buy bull\n' +
      'Bearish and want to have some hedge? Buy bear'
  },
  {
    title: 'What is option? ',
    content:
      'An option is a contract giving the buyer the right, but not the obligation, to buy (in the case of a bull option contract) or sell (in the case of a bear option contract) the underlying asset at a specific price on or before a certain date. Traders can use on-chain options for speculation or to hedge their positions. Options are known as derivatives because they derive their value from an underlying asset.\n\nIn short, if you are bullish, buy bull option tokens, if you are bearish, buy bear option tokens.'
  },
  {
    title: 'Antimatter option feature',
    content: (
      <List
        list={[
          'Each option has a pair of tokens: bull token and bear token',
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
      'You can buy and sell bull and bear tokens in the option market page. The experience is same as if you trade tokens on uniswap.'
  },
  {
    title: 'Market Strategy',
    content:
      'You can generate and redeem bull and bear tokens in this section. In addition, you can provide liquidity to the bull and bear tokens through market strategy.'
  }
]

export default function WelcomeSlider() {
  // const { account } = useActiveWeb3React()
  const [isOpen, setIsOpen] = useState<boolean>(!(window && window.localStorage.getItem('visited')))
  const [page, setPage] = useState(0)
  const isEndPage = page === pageContent.length - 1
  // const node = useRef<HTMLDivElement>()
  const theme = useTheme()
  const upToSmall = useMediaWidth('upToSmall')
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
      // isOpen={upToSmall ? false : isOpen}
      style={{ alignItems: upToSmall ? 'flex-end' : 'center' }}
    >
      <StyledDialogContent
        maxWidth="580"
        border={'1px solid ' + theme.bg4}
        style={{ alignSelf: 'unset', width: 'auto' }}
      >
        <WelcomeCard>
          <AutoColumn gap="20px" style={{ padding: '12px 24px' }}>
            <RowBetween>
              <TYPE.body fontSize={22}>{pageContent[page].title}</TYPE.body>
              <CloseIcon onClick={handleClose} />
            </RowBetween>
            <TYPE.body style={{ whiteSpace: 'pre-wrap' }}>{pageContent[page].content}</TYPE.body>
            <RowFixed style={{ marginTop: '20px', width: '100%' }}>
              {!isEndPage && (
                <ButtonWhite style={{ padding: '9px', marginRight: '20px' }} onClick={handleClose}>
                  <TYPE.main fontSize={14}>Skip </TYPE.main>
                </ButtonWhite>
              )}
              <ButtonWhite style={{ padding: '9px', backgroundColor: '#FFFFFF' }} onClick={handleNextClick}>
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
