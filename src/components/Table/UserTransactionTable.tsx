import React, { useMemo } from 'react'
import { TokenAmount } from '@uniswap/sdk'
import styled from 'styled-components'
import { TableContainer, TableHead, TableCell, TableRow, TableBody } from '@material-ui/core'
import { useOption } from '../../state/market/hooks'
import { MyTransactionProp, MyPositionType } from 'hooks/useUserFetch'
import { ButtonOutlined } from 'components/Button'
import { useHistory } from 'react-router'
import { parseBalance } from 'utils/marketStrategyUtils'
import { useStyles } from './index'

const TableButtonOutlined = styled(ButtonOutlined)`
  height: 40px;
  width: 100px;
  color: #b2f355;
  border: 1px solid #b2f355;
  opacity: 0.8;
  &:hover {
    border: 1px solid #b2f355;
    opacity: 1;
  }
`

export function UserTransactionTable({
  header,
  data,
  isHeaderGray
}: {
  header: string[]
  data: MyTransactionProp[]
  isHeaderGray?: boolean
}) {
  const classes = useStyles({ isHeaderGray })
  return (
    <>
      {
        <TableContainer className={classes.root}>
          <table>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                {header.map((string, idx) => (
                  <TableCell key={idx}>{string}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx} className={classes.tableRow}>
                  <UserPositionTableCell data={row} />
                </TableRow>
              ))}
            </TableBody>
          </table>
        </TableContainer>
      }
    </>
  )
}

function UserPositionTableCell({ data }: { data: MyTransactionProp }) {
  const option = useOption(data.optionIndex)
  const history = useHistory()
  const positionData = useMemo(() => {
    let name = '-'
    if (option && option.currency && option.priceFloor && option.priceCap) {
      name = `${option.underlying?.symbol} ($${new TokenAmount(
        option.currency,
        option.priceFloor
      ).toSignificant()}~$${new TokenAmount(option.currency, option.priceCap).toSignificant()})`
    }
    let amount = '-'
    if (option && option.callToken && option.putToken) {
      const token = data.type === MyPositionType.Call ? option.callToken : option.putToken
      amount = parseBalance({ val: data.tradesAmount, token })
      // amount = new TokenAmount(token, data.tradesAmount.replace('-', '')).toSignificant()
    }
    return [
      name,
      data.type,
      amount,
      '$$$',
      '$$$',
      <TableButtonOutlined onClick={() => history.push('/option_trading/' + data.optionIndex)} key={2}>
        Trade
      </TableButtonOutlined>
    ]
  }, [data, history, option])

  return (
    <>
      {positionData.map((data, idx) => (
        <TableCell key={idx}>{data}</TableCell>
      ))}
    </>
  )
}
