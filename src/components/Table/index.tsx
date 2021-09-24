import React, { useMemo } from 'react'
import styled from 'styled-components'
import { TableContainer, TableHead, TableCell, TableRow, TableBody, makeStyles } from '@material-ui/core'
import useMediaWidth from 'hooks/useMediaWidth'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { TYPE } from 'theme'
import { useOption } from '../../state/market/hooks'
import { MyPositionProp, MyPositionType } from 'hooks/useUserFetch'
import Copy from 'components/AccountDetails/Copy'
import { shortenAddress } from 'utils'
import { RowFixed } from 'components/Row'
import { ButtonOutlined } from 'components/Button'
import { TokenAmount } from '@uniswap/sdk'
import { useHistory } from 'react-router'
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

interface StyleProps {
  isHeaderGray?: boolean
}

const Profile = styled.div`
  display: flex;
  align-items: center;
`

export const TableProfileImg = styled.div<{ url?: string }>`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
  background: #000000 ${({ url }) => (url ? `url(${url})` : '')};
`

export function OwnerCell({ url, name }: { url?: string; name: string }) {
  return (
    <Profile>
      <TableProfileImg url={url} />
      {name}
    </Profile>
  )
}

const useStyles = makeStyles({
  root: {
    display: 'table',
    borderRadius: '40px',
    '& .MuiTableCell-root': {
      fontSize: '16px',
      borderBottom: 'none',
      padding: '14px 20px',
      '& svg': {
        marginRight: 8
      },
      '&:first-child': {
        paddingLeft: 50
      },
      '&:last-child': {
        paddingRight: 50
      }
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse'
    }
  },
  tableHeader: {
    background: ({ isHeaderGray }: StyleProps) => (isHeaderGray ? 'rgba(247, 247, 247, 1)' : 'transparent'),
    borderRadius: ({ isHeaderGray }: StyleProps) => (isHeaderGray ? 14 : 0),
    overflow: 'hidden',
    '& .MuiTableCell-root': {
      padding: '22px 20px',
      fontSize: '12px',
      fontWeight: 500,
      color: 'rgba(255,255,255, 0.8)',
      borderBottom: ({ isHeaderGray }: StyleProps) => (isHeaderGray ? 'none' : '1px solid #333333'),
      '&:first-child': {
        paddingLeft: 50
      },
      '&:last-child': {
        paddingRight: 50
      }
    }
  },
  tableRow: {
    borderBottom: ({ isHeaderGray }: StyleProps) =>
      isHeaderGray ? '1px solid rgba(247, 247, 247, 1)' : '1px solid #333',
    height: 72,
    '&:hover': {
      backgroundColor: ' rgba(255, 255, 255, 0.08)'
    },
    '& .MuiTableCell-root': {
      color: '#fff'
    },
    '&:last-child': {
      border: 'none'
    }
  }
})

const Card = styled.div`
  background: #ffffff;
  border-radius: 30px;
  padding: 24px;
  > div {
    width: 100%;
  }
`

const CardRow = styled(RowBetween)`
  grid-template-columns: auto 100%;
  > div:first-child {
    white-space: nowrap;
  }
  > div:last-child {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
`

export default function Table({
  header,
  rows,
  isHeaderGray
}: {
  header: string[]
  rows: (string | number | JSX.Element)[][]
  isHeaderGray?: boolean
}) {
  const match = useMediaWidth('upToSmall')
  const classes = useStyles({ isHeaderGray })
  return (
    <>
      {match ? (
        <>
          {rows.map((data, index) => (
            <Card key={index}>
              <AutoColumn gap="16px">
                {header.map((headerString, index) => (
                  <CardRow key={index}>
                    <TYPE.darkGray>{headerString}</TYPE.darkGray>
                    <TYPE.body color="#000000"> {data[index] ?? null}</TYPE.body>
                  </CardRow>
                ))}
              </AutoColumn>
            </Card>
          ))}
        </>
      ) : (
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
              {rows.map((row, idx) => (
                <TableRow key={row[0].toString() + idx} className={classes.tableRow}>
                  {row.map((data, idx) => (
                    <TableCell key={idx}>{data}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </TableContainer>
      )}
    </>
  )
}

export function UserPostionTable({
  header,
  data,
  isHeaderGray
}: {
  header: string[]
  data: MyPositionProp[]
  isHeaderGray?: boolean
}) {
  const classes = useStyles({ isHeaderGray })
  return (
    <>
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
                <UserPostionTableCell data={row} />
              </TableRow>
            ))}
          </TableBody>
        </table>
      </TableContainer>
    </>
  )
}

function UserPostionTableCell({ data }: { data: MyPositionProp }) {
  const option = useOption(data.optionIndex)
  const history = useHistory()
  const postionData = useMemo(() => {
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
      amount = new TokenAmount(token, data.tradesAmount.replace('-', '')).toSignificant()
    }
    return [
      name,
      data.type,
      amount,
      <RowFixed key={1}>
        {shortenAddress(data.contract ?? '', 5)}
        <Copy toCopy={data.contract}></Copy>
      </RowFixed>,
      <TableButtonOutlined onClick={() => history.push('/option_trading/' + data.optionIndex)} key={2}>
        Trade
      </TableButtonOutlined>
    ]
  }, [data, history, option])

  return (
    <>
      {postionData.map((data, idx) => (
        <TableCell key={idx}>{data}</TableCell>
      ))}
    </>
  )
}
