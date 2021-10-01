import React from 'react'
import MuiPagination from '@material-ui/lab/Pagination'
import styled from 'styled-components'
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/core/styles'
import { createTheme } from '@material-ui/core/styles'

const materialTheme = createTheme({
  palette: {
    type: 'dark'
  }
})

const materialThemeLight = createTheme({
  palette: {
    type: 'light'
  }
})

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;
  & > * {
    margin-bottom: 20px;
  }
`

interface PaginationProps {
  count: number
  page: number
  setPage: (page: number) => void
  onChange?: (event: object, page: number) => void
  isLightBg?: boolean
}
export default function Pagination({ count, page, onChange, setPage, isLightBg }: PaginationProps) {
  return (
    <MaterialThemeProvider theme={isLightBg ? materialThemeLight : materialTheme}>
      {count && (
        <StyledPagination>
          <MuiPagination
            count={count}
            page={page}
            onChange={(event, page) => {
              onChange && onChange(event, page)
              setPage(page)
            }}
            size="large"
          />
        </StyledPagination>
      )}
    </MaterialThemeProvider>
  )
}
