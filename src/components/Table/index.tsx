import React from 'react'
import styled from 'styled-components'
import { TableContainer, TableHead, TableCell, TableRow, TableBody, makeStyles } from '@material-ui/core'
import useMediaWidth from 'hooks/useMediaWidth'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { TYPE } from 'theme'
export * from './UserTransactionTable'

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

export const useStyles = makeStyles(theme => ({
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
      color: 'rgba(255,255,255, 0.6)',
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
  },
  longTitle: {
    [theme.breakpoints.down('sm')]: {
      whiteSpace: 'pre-wrap'
    }
  }
}))

const Card = styled.div`
  background: ${({ theme }) => theme.gradient1};
  border-radius: 30px;
  padding: 24px;
  > div {
    width: 100%;
  }
`

const CardRow = styled(RowBetween)`
  grid-template-columns: auto 100%;
  > div:first-child {
    white-space: pre-wrap;
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
        <AutoColumn gap="20px" style={{ marginTop: 20 }}>
          {rows.map((data, index) => (
            <Card key={index}>
              <AutoColumn gap="16px">
                {header.map((headerString, index) => (
                  <CardRow key={index}>
                    <TYPE.darkGray className={classes.longTitle}>{headerString}</TYPE.darkGray>
                    <TYPE.body> {data[index] ?? null}</TYPE.body>
                  </CardRow>
                ))}
              </AutoColumn>
            </Card>
          ))}
        </AutoColumn>
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
