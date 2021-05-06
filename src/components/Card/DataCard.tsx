import React from 'react'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { TYPE } from 'theme'
import { OutlineCard } from '.'
import useTheme from 'hooks/useTheme'

export interface DataType {
  title: JSX.Element | string
  content: JSX.Element | string | undefined
}

export function DataRow({ data: { title, content }, rowHeight }: { data: DataType; rowHeight?: string }) {
  const theme = useTheme()
  return (
    <RowBetween style={{ height: rowHeight ?? 'auto' }}>
      <TYPE.small color={theme.text3}>{title}</TYPE.small>
      <TYPE.small color={theme.text1}>{content}</TYPE.small>
    </RowBetween>
  )
}

export default function DataCard({
  data,
  cardTitle,
  bgColor = 'rgba(0,0,0,.2)',
  cardBottom,
  rowHeight
}: {
  data: DataType[]
  cardTitle?: JSX.Element | string
  bgColor?: string
  cardBottom?: JSX.Element | string
  rowHeight?: string
}) {
  const theme = useTheme()
  return (
    <OutlineCard style={{ backgroundColor: bgColor, padding: '0' }}>
      {cardTitle && (
        <RowBetween style={{ padding: '12px 24px', borderBottom: `1px solid ${theme.text5}` }}>
          <TYPE.subHeader fontWeight={500} fontSize={14} color={theme.text1} width="100%">
            {cardTitle}
          </TYPE.subHeader>
        </RowBetween>
      )}
      <AutoColumn gap="8px" style={{ padding: '12px 24px' }}>
        {data.map((data, idx) => (
          <DataRow data={data} key={`${data.title}${idx}`} rowHeight={rowHeight} />
        ))}
      </AutoColumn>
      {cardBottom && (
        <RowBetween style={{ padding: '12px 24px', borderTop: `1px solid ${theme.text5}` }}>
          <TYPE.subHeader fontWeight={500} fontSize={14} color={theme.text1} width="100%">
            {cardBottom}
          </TYPE.subHeader>
        </RowBetween>
      )}
    </OutlineCard>
  )
}
