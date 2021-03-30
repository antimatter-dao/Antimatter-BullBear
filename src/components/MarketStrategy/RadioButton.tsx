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

export function RadioButton({
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
    <Label checked={checked}>
      <input type="radio" name={name} checked={checked} onChange={onCheck} />
      {label}
    </Label>
  )
}
