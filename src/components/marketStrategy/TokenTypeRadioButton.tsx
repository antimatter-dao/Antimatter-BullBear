import React from 'react'
import styled from 'styled-components'

const Label = styled.label<{ checked: boolean }>`
  wrap: nowrap;
  display: flex;
  align-items:center;

  :before {
  content: '';
  display: block;
  width: 6px;
  height: 6px;
  background-color: ${({ theme, checked }) => (checked ? theme.primary1 : 'transparent')};
  border-radius: 50%;
  margin-right:8px
  border: 4px solid ${({ theme }) => theme.bg1};
  box-shadow: 0 0 0 1px ${({ theme, checked }) => (checked ? theme.primary1 : theme.text1)};

}
& input {
  display: none;
}
`

function RadioButton({
  label,
  name,
  checked,
  onCheck
}: {
  label: string
  name: string
  checked: boolean
  onCheck: () => void
}) {
  return (
    <Label checked={checked} onClick={onCheck}>
      <input type="radio" name={name} checked={checked} />
      {label}
    </Label>
  )
}

export const TOKEN_TYPES = {
  call: 'call',
  put: 'put',
  callPut: 'CallAndPut'
}

export default function TokenTypeRadioButton({
  selected,
  onCheck
}: {
  selected: string
  onCheck: (tokenType: string) => void
}) {
  return (
    <fieldset id="tokeType" style={{ border: 'none', display: 'flex', justifyContent: 'space-between', padding: '0' }}>
      <RadioButton
        label="Call token + Put token"
        name="tokeType"
        checked={selected === TOKEN_TYPES.callPut}
        onCheck={() => onCheck(TOKEN_TYPES.callPut)}
      />
      <RadioButton
        label="Call token"
        name="tokeType"
        checked={selected === TOKEN_TYPES.call}
        onCheck={() => onCheck(TOKEN_TYPES.call)}
      />
      <RadioButton
        label="Put token"
        name="tokeType"
        checked={selected === TOKEN_TYPES.put}
        onCheck={() => onCheck(TOKEN_TYPES.put)}
      />
    </fieldset>
  )
}
