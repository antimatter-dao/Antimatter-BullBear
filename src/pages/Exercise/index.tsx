import React, { useCallback, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import AppBody, { BodyHeader } from '../AppBody'
import { AutoColumn } from '../../components/Column'
import ButtonSelect from '../../components/Button/ButtonSelect'
import NumberInputPanel from '../../components/NumberInputPanel'
import { ButtonPrimary } from '../../components/Button'
import { Wrapper } from '../../components/swap/styleds'

const optionTypes = [
  {
    id: 'callOption',
    option: 'Call option'
  },
  { id: 'putOption', option: 'Put Option' }
]

export default function Exercise({ history }: RouteComponentProps) {
  const [optionType, setOptionType] = useState(optionTypes[0].id)

  const handleOptionTypeSelect = useCallback(
    (type: string) => {
      setOptionType(type) // reset 2 step UI for approvals
    },
    [setOptionType]
  )

  return (
    <AppBody>
      <BodyHeader title={'Option Execrise'} />
      <Wrapper id="swap-page" style={{ padding: '0 0', marginTop: '20px' }}>
        <AutoColumn gap="20px">
          <ButtonSelect
            label="Option Type"
            onSelection={handleOptionTypeSelect}
            options={optionTypes}
            selectedId={optionType}
          />

          <NumberInputPanel
            disabled={true}
            label={'Token Exercise'}
            value={'You have the rights to purchase ETH at 100 USDT'}
            showMaxButton={false}
            hideBalance={true}
            onUserInput={() => {}}
            onMax={() => {}}
            id="swap-currency-input"
          />

          <NumberInputPanel
            label={'CALL Tokens Amount to Exercise'}
            value={''}
            showMaxButton={true}
            onUserInput={() => {}}
            onMax={() => {}}
            id="swap-currency-input"
          />
          <ButtonPrimary disabled={false} onClick={() => {}} borderRadius="49px">
            Exercise
          </ButtonPrimary>
        </AutoColumn>
      </Wrapper>
    </AppBody>
  )
}
