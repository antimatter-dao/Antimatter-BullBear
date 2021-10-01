import React, { useState, useCallback } from 'react'
// import { X } from 'react-feather'
import styled from 'styled-components'
import { RowFixed } from 'components/Row'
import { Currency, Token } from '@uniswap/sdk'
import { ButtonOutlinedPrimary, ButtonPrimary } from 'components/Button'
import { ReactComponent as SearchIcon } from '../../assets/svg/search.svg'
import { currencyNameHelper } from 'utils/marketStrategyUtils'
// import { TextValueInput } from 'components/TextInput'
import { /*CloseIcon, MEDIA_WIDTHS,*/ TYPE } from 'theme'
// import { ButtonSelectRange, Range } from 'components/Button/ButtonSelectRange'
import { ButtonSelectNumericalInput } from 'components/Button/ButtonSelectNumericalInput'
// import useMediaWidth from 'hooks/useMediaWidth'
import CurrencySearchModal from 'components/SearchModal/CurrencySearchModal'
import ButtonSelect from 'components/Button/ButtonSelect'
import useTheme from 'hooks/useTheme'
import CurrencyLogo from 'components/CurrencyLogo'

export interface SearchQuery {
  optionIndex?: number | string
  id?: number | string
  priceCap?: number | string
  priceFloor?: number | string
  underlyingSymbol?: string
}

const ALL = {
  id: 'ALL',
  title: 'All'
}

const WrapperSearch = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.text5};
`

const StyledSearch = styled.div`
  margin: auto;
  padding: 23px 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  max-width: 1280px;
  & > div {
    flex-shrink: 1;
  }
  /* ${({ theme }) => theme.mediaWidth.upToLarge`
    padding: 23px 50px;
    width: 100%;
    flex-wrap: wrap
    flex-direction: column
    grid-gap:10px;
  `} */
  ${({ theme }) => theme.mediaWidth.upToSmall`
  padding: 10px 14px 0px;
  width: 100%;
  flex-wrap: wrap
  flex-direction: column
  &>div {
    margin-bottom: 20px;
  }
`}
`

const ButtonWrapper = styled(RowFixed)`
  margin-left: 32px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-left: 0;
  `}
  ${({ theme }) => theme.mediaWidth.upToSmall`
  margin-bottom: 20px;
  flex-direction: column
  width: 100%;
  button{
    width: 100%;
    margin-right: 14px;
    :first-child{
      margin-bottom: 16px
    }
  }
`};
`

// const MobileSearchWrapper = styled.div`
//   position: fixed;
//   top: 0;
//   right: 0;
//   padding: ${({ theme }) => theme.mobileHeaderHeight} 24px 24px
//   width: 100%;
//   background-color: ${({ theme }) => theme.bg1};
//   z-index: 12;
//   height: 100vh;
// `

// const MobileSearchButton = styled(ButtonEmpty)`
//   position: fixed;
//   top: 21px;
//   z-index: 11;
//   right: 72px;
//   width: fit-content;
//   height: auto;
//   svg {
//     z-index: 11;
//   }
// `

// const MobileCloseIcon = styled(CloseIcon)`
//   position: absolute;
//   top: 32px;
//   right: 25px;
//   > * {
//     stroke: #ffffff;
//   }
// `

// const ButtonWrapper = styled(RowFixed)`
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//   flex-direction: column
//   width: 100%;
//   button{
//     width: 100%;
//     :first-child{
//       margin-bottom: 8px
//     }
//   }
// `}
// `

// export function Search2({ onSearch }: { onSearch: (searchParam: string, searchBy: string) => void }) {
//   const [searchParam, setSearchParam] = useState('')
//   const [searchBy, setSearchBy] = useState('')
//   const match = useMediaWidth('upToLarge')

//   const handleSearch = useCallback(() => {
//     onSearch(searchParam, searchBy)
//   }, [onSearch, searchBy, searchParam])

//   const handleClear = useCallback(() => {
//     setSearchParam('')
//     setSearchBy('')
//     onSearch('', '')
//   }, [onSearch])

//   return (
//     <>
//       <WrapperSearch>
//         <StyledSearch>
//           <NFTButtonSelect
//             onSelection={id => {
//               setSearchParam(id)
//             }}
//             width={match ? '100%' : '280px'}
//             options={SearchParams}
//             selectedId={searchParam}
//             placeholder="Select search parameter"
//             marginRight={match ? '0' : '10px'}
//           />
//           <TextValueInput
//             borderColor="#ffffff"
//             value={searchBy}
//             onUserInput={val => {
//               setSearchBy(val)
//             }}
//             placeholder="Search by"
//             height="3rem"
//             maxWidth={match ? 'unset' : '552px'}
//           />
//           <ButtonWrapper>
//             <ButtonPrimary width="152px" onClick={handleSearch}>
//               <SearchIcon style={{ marginRight: 10, fill: '#000000' }} />
//               Search
//             </ButtonPrimary>
//             <div style={{ width: 10 }} />
//             <ButtonOutlinedPrimary width="152px" onClick={handleClear}>
//               Show All
//             </ButtonOutlinedPrimary>
//           </ButtonWrapper>
//         </StyledSearch>
//       </WrapperSearch>
//     </>
//   )
// }

// export function MobileSearch({ onSearch }: { onSearch: (searchParam: string, searchBy: string) => void }) {
//   const [isOpen, setIsOpen] = useState(false)
//   const match = useMediaWidth('upToSmall' as keyof typeof MEDIA_WIDTHS)

//   useEffect(() => {
//     if (!match) {
//       setIsOpen(false)
//     }
//   }, [match])

//   const handleOpen = useCallback(() => {
//     setIsOpen(true)
//   }, [])

//   const handleClose = useCallback(() => {
//     setIsOpen(false)
//   }, [])

//   return (
//     <>
//       <MobileSearchButton onClick={handleOpen} id="mobileSearch">
//         <SearchIcon style={{ fill: '#ffffff' }} />
//       </MobileSearchButton>
//       {isOpen && (
//         <MobileSearchWrapper>
//           <MobileCloseIcon onClick={handleClose} />
//           {/* <ButtonEmpty onClick={handleClose}>
//             <X size={24} />
//           </ButtonEmpty> */}
//           <TYPE.body fontSize={28} fontWeight={500}>
//             Search a sport index
//           </TYPE.body>
//           <Search onSearch={onSearch} />
//         </MobileSearchWrapper>
//       )}
//     </>
//   )
// }

export default function Search({
  // onOptionType,
  // optionTypeQuery,
  onClear,
  onSearch,
  tokenList
}: {
  // onOptionType?: (type: string) => void
  // optionTypeQuery?: string
  onClear?: () => void
  onSearch: (query: any) => void
  tokenList?: Token[]
}) {
  const [assetTypeQuery, setAssetTypeQuery] = useState<Currency | undefined>(undefined)
  const [optionIdQuery, setOptionIdQuery] = useState('')
  // const [rangeQuery, setRangeQuery] = useState<Range>({
  //   floor: undefined,
  //   cap: undefined
  // })
  const [currencySearchOpen, setCurrencySearchOpen] = useState(false)

  const handleDismissSearch = useCallback(() => setCurrencySearchOpen(false), [])
  const handleOpenAssetSearch = useCallback(() => setCurrencySearchOpen(true), [])
  const handleSearch = useCallback(() => {
    const body = {} as SearchQuery
    if (optionIdQuery) {
      body.id = +optionIdQuery
    }
    // if (assetTypeQuery && assetTypeQuery.symbol === ALL.id) {
    //   if (rangeQuery.floor !== undefined && assetTypeQuery) {
    //     body.priceFloor = JSBI.multiply(
    //       JSBI.BigInt(rangeQuery.floor),
    //       JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(assetTypeQuery?.decimals))
    //     ).toString()
    //   }
    //   if (rangeQuery.cap !== undefined && assetTypeQuery) {
    //     body.priceCap = JSBI.multiply(
    //       JSBI.BigInt(rangeQuery.cap),
    //       JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(assetTypeQuery?.decimals))
    //     ).toString()
    //   }
    // }

    if (assetTypeQuery) {
      if (assetTypeQuery.symbol === ALL.id) {
        delete body.underlyingSymbol
      } else {
        body.underlyingSymbol = assetTypeQuery.symbol
      }
    }

    onSearch(body)
  }, [assetTypeQuery, onSearch, optionIdQuery])
  const handleClear = useCallback(() => {
    onClear && onClear()
    setAssetTypeQuery(undefined)
    setOptionIdQuery('')
    // setRangeQuery({
    //   floor: undefined,
    //   cap: undefined
    // })
  }, [onClear])

  const theme = useTheme()

  return (
    <>
      <CurrencySearchModal
        isOpen={currencySearchOpen}
        onDismiss={handleDismissSearch}
        onCurrencySelect={setAssetTypeQuery}
        tokenList={tokenList ?? []}
      />
      <WrapperSearch>
        <StyledSearch>
          <ButtonSelect onClick={handleOpenAssetSearch}>
            <TYPE.body color={assetTypeQuery ? theme.text1 : theme.text3}>
              <RowFixed>
                {assetTypeQuery && assetTypeQuery.symbol !== ALL.id && (
                  <CurrencyLogo currency={assetTypeQuery} size={'24px'} style={{ marginRight: 15 }} />
                )}
                {currencyNameHelper(assetTypeQuery, 'Select asset type')}
              </RowFixed>
            </TYPE.body>
          </ButtonSelect>
          {/* {onOptionType && (
            <ButtonSelect
              placeholder="Select option type"
              selectedId={optionTypeQuery}
              onSelection={onOptionType}
              options={[
                { id: ALL.id, option: ALL.title },
                { id: Type.CALL, option: 'Call Option' },
                { id: Type.PUT, option: 'Put Option' }
              ]}
            />
          )} */}
          <ButtonSelectNumericalInput
            placeholder="Select option ID"
            value={optionIdQuery}
            onSetValue={setOptionIdQuery}
          />
          {/* <ButtonSelectRange
            placeholder="Select price range"
            rangeCap={rangeQuery.cap?.toString()}
            rangeFloor={rangeQuery.floor?.toString()}
            onSetRange={setRangeQuery}
            disabled={!assetTypeQuery}
          /> */}
          <ButtonWrapper>
            <ButtonPrimary width="186px" onClick={handleSearch}>
              <SearchIcon style={{ marginRight: 10 }} />
              Search
            </ButtonPrimary>
            <div style={{ width: 10 }} />
            <ButtonOutlinedPrimary width="186px" onClick={handleClear}>
              Show All
            </ButtonOutlinedPrimary>
          </ButtonWrapper>
        </StyledSearch>
      </WrapperSearch>
    </>
  )
}
