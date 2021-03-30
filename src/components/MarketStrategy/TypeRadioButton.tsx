import React from 'react'
import { RadioButton } from './RadioButton'

export const TOKEN_TYPES = {
  call: 'call',
  put: 'put',
  callPut: 'CallAndPut'
}

export function TypeRadioButton({ selected, onCheck }: { selected: string; onCheck: (tokenType: string) => void }) {
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
