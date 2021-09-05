import { SVGAttributes } from 'react'

export const ShortLogo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M.301 1.25C.301.56.861 0 1.551 0h4.167a1.25 1.25 0 010 2.5H1.55c-.69 0-1.25-.56-1.25-1.25zm13.256 1.235a1.25 1.25 0 01-.74 1.605L1.983 8.08a1.25 1.25 0 11-.864-2.345l10.833-3.991a1.25 1.25 0 011.605.74zm0 10.175a1.25 1.25 0 01-.74 1.605L1.983 18.256a1.25 1.25 0 01-.864-2.346l10.833-3.99a1.25 1.25 0 011.605.74zm-6.59 6.09c0-.69.56-1.25 1.25-1.25h4.167a1.25 1.25 0 010 2.5H8.218c-.69 0-1.25-.56-1.25-1.25zM13.551 7.468a1.25 1.25 0 01-.718 1.615L2 13.25a1.25 1.25 0 11-.898-2.333L11.936 6.75a1.25 1.25 0 011.615.718z"
        fill="currentColor"
      />
    </svg>
  )
}
