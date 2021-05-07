import React, { useState, useCallback } from 'react'
import { X } from 'react-feather'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Modal from '.'
import { TYPE } from 'theme'
import { RowBetween } from 'components/Row'

export default function WarningModal() {
  const [isOpen, setIsOpen] = useState(true)
  const handleClose = useCallback(() => setIsOpen(false), [setIsOpen])
  return (
    <>
      {isOpen && (
        <Modal maxWidth={608} isOpen={isOpen} onDismiss={handleClose}>
          <AutoColumn
            gap="24px"
            style={{
              margin: 32
            }}
          >
            <RowBetween>
              <div /> <TYPE.mediumHeader style={{ textAlign: 'center' }}>Warning!</TYPE.mediumHeader>
              <X onClick={handleClose} style={{ cursor: 'pointer' }} />
            </RowBetween>

            <TYPE.body>
              Please note.The dapp is only open to non-U.S. persons and entities. All registrants must meet eligibility
              requirements to participate.
              <br />
              <br />
              The dapp is not and will not be offered or sold, directly or indirectly, to any person who is a resident,
              organized, or located in any country or territory subject to OFAC comprehensive sanctions programs from
              time to time, including Cuba, Crimea region of Ukrain, Democratic people’s Republic of Korea, Iran, Syria,
              any person found on the OFAC specially designated nationals, blocked persons list, any other consolidated
              prohibited persons list as determined by any applicable governmental authority.
            </TYPE.body>
            <ButtonPrimary onClick={handleClose}>Understand</ButtonPrimary>
          </AutoColumn>
        </Modal>
      )}
    </>
  )
}
