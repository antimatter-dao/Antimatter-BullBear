import React from 'react'
import { RadioButton } from './RadioButton'

interface RadioOption {
  label: string
  option: string
}

export function TypeRadioButton({
  name,
  options,
  selected,
  onCheck
}: {
  name: string
  options: RadioOption[]
  selected: string
  onCheck: (tokenType: string) => void
}) {
  return (
    <fieldset id={name} style={{ border: 'none', display: 'flex', justifyContent: 'space-between', padding: '0' }}>
      {options.map(({ label, option }) => {
        return (
          <RadioButton
            key={label}
            label={label}
            name={name}
            checked={selected === option}
            onCheck={() => onCheck(option)}
          />
        )
      })}
    </fieldset>
  )
}
