import React, { useState } from 'react'
import { Plus, Minus } from 'react-feather'
import AppBody from 'pages/AppBody'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'
import { AutoColumn } from 'components/Column'
import useTheme from 'hooks/useTheme'
import styled from 'styled-components'

const Badge = styled.div`
  border: 1px solid ${({ theme }) => theme.bg5};
  padding:8px 16px
  height: 36px;
  border-radius: 6px;
  width: fit-content
`
const Divider = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.bg3};
  height: 0;
  margin-bottom: 20px;
`

const faqList = [
  {
    question: 'What is the symbol system for an antimatter option product?',
    answer:
      'An option product consists of call and put tokens.\nAntimatter uses a standardized systematic way to represents:\n1. Option product    2. Call token    3. Put token'
  },
  {
    question: 'What is the symbol system for an antimatter option type?',
    answer: (
      <>
        <div>
          An option product has three variables to consider:
          <br />
          1. Asset 2. Price floor 3. Price ceiling
          <br />
          <br />
          The Symbol is as followed:
        </div>
        <br />
        <Badge>ASSET(Price floor $ Price ceiling)</Badge>
        <br />
        e.g. The ETH OPTION from 1000 to 3000 will be represented as ETH(1000$3000)
      </>
    )
  },
  {
    question: 'What is the symbol system for an antimatter call token?',
    answer: (
      <>
        <div>
          A CALL OPTION TOKEN has three variables to consider:
          <br />
          1. Call 2. Asset 3. Price floor
          <br />
          <br />
          The Symbol is as followed:
        </div>
        <br />
        <Badge>+ASSET ($ price floor)</Badge>
        <br />
        e.g. The ETH call OPTION from 1000 will look like +ETH($1000)
      </>
    )
  },
  {
    question: 'What is the symbol system for an antimatter put token?',
    answer: (
      <>
        <div>
          A PUT OPTION TOKEN has three variables to consider:
          <br />
          1. Put 2. Asset 3. Price ceiling
          <br />
          <br />
          The Symbol is as followed:
        </div>
        <br />
        <Badge>-ASSET ($ price ceiling)</Badge>
        <br />
        e.g. The ETH put OPTION from 3000 will look like -ETH($3000)
      </>
    )
  }
]

function Accordion({
  faq: { question, answer },
  isLast
}: {
  faq: { question: string; answer: string | JSX.Element }
  isLast?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useTheme()
  const handleClick = () => setIsOpen(!isOpen)
  return (
    <>
      <AutoColumn>
        <RowBetween marginBottom={20}>
          <TYPE.main>{question}</TYPE.main>
          {isOpen ? (
            <Minus color={theme.primary1} onClick={handleClick} />
          ) : (
            <Plus color={theme.primary1} onClick={handleClick} />
          )}
        </RowBetween>
        {isOpen && (
          <TYPE.body style={{ whiteSpace: 'pre-wrap', color: theme.text2 }} marginBottom={20}>
            {answer}
          </TYPE.body>
        )}
      </AutoColumn>
      {!isLast && <Divider />}
    </>
  )
}

export default function FAQ() {
  return (
    <AppBody style={{ maxWidth: 540, padding: '23px 32px 22px 32px' }}>
      <TYPE.mediumHeader marginBottom={24}>FAQ</TYPE.mediumHeader>
      <AutoColumn>
        {faqList.map((faq, idx) => (
          <Accordion key={faq.question} faq={faq} isLast={idx === faqList.length - 1} />
        ))}
      </AutoColumn>
    </AppBody>
  )
}
