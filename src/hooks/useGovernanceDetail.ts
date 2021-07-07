import { useGovernanceContract } from './useContract'
import { useSingleCallResult, useSingleContractMultipleData } from '../state/multicall/hooks'
import { useWeb3React } from '@web3-react/core'

interface GovernanceContent {
  summary: string
  details: string
  agreeFor: string
  againstFor: string
}

interface Users {
  totalNo: string
  totalStake: string
  totalYes: string
}

enum StatusOption {
  Live = 'Live',
  Success = 'Success',
  Faild = 'Faild'
}

export interface GovernanceData {
  id: string
  title: string
  creator: string
  contents: GovernanceContent | undefined
  timeLeft: string
  voteFor: string
  voteAgainst: string
  totalVotes: string
  status?: StatusOption
}

export function useGovernanceDetails(index: string) {
  const contact = useGovernanceContract()
  const proposesRes = useSingleCallResult(contact, 'proposes', [index])
  const resultRes = useSingleCallResult(contact, 'getResult', [index])

  const result = proposesRes.result

  const ret: GovernanceData = {
    id: index,
    title: result ? result.subject : '',
    creator: result ? result.creator : '',
    timeLeft: result ? result.endTime.toString() : '',
    voteFor: result ? result.yes.toString() : '',
    voteAgainst: result ? result.no.toString() : '',
    totalVotes: result ? result.totalStake.toString() : '',
    contents: result ? JSON.parse(result.content) : undefined,
    status: resultRes.result
      ? resultRes.result.toString() === '1'
        ? StatusOption.Success
        : resultRes.result.toString() === '2'
        ? StatusOption.Faild
        : StatusOption.Live
      : StatusOption.Live
  }

  return { data: ret, loading: proposesRes.loading }
}

export function useGovernanceCount(): number | undefined {
  const contact = useGovernanceContract()
  const res = useSingleCallResult(contact, 'proposeCount')
  if (res.result && !res.loading) {
    return parseInt(res.result[0])
  }
  return undefined
}

export function useGovernanceList(): GovernanceData[] | undefined {
  const contact = useGovernanceContract()
  const proposeCount = useGovernanceCount()
  const proposeIndexes = []
  for (let i = 0; i < (proposeCount ?? 0); i++) {
    proposeIndexes.push([i])
  }
  const proposesListRes = useSingleContractMultipleData(contact, 'proposes', proposeIndexes)
  //const resultsRes = useSingleCallResult(contact, 'getResult', [index])

  return proposesListRes.map(({ result }, index) => {
    const title: string = result?.subject
    const creator: string = result?.creator
    const timeLeft: string = result?.endTime.toString()
    const voteFor: string = result?.yes.toString()
    const voteAgainst: string = result?.no.toString()
    const totalVotes: string = result?.totalStake.toString()
    const summary: string = result ? JSON.parse(result?.content).summary : ''
    const details: string = result ? JSON.parse(result?.content).details : ''
    const agreeFor: string = result ? JSON.parse(result?.content).agreeFor : ''
    const againstFor: string = result ? JSON.parse(result?.content).againstFor : ''

    return {
      id: index.toString(),
      title,
      creator,
      timeLeft,
      voteFor,
      voteAgainst,
      totalVotes,
      contents: {
        summary,
        details,
        agreeFor,
        againstFor
      }
    }
  })
}

export function useUserStaking(proposeid: string | number | undefined): Users {
  const { account } = useWeb3React()
  const contact = useGovernanceContract()
  const usersRes = useSingleCallResult(contact, 'users', [proposeid, account ?? ''])

  const res = usersRes.result

  const ret = {
    totalNo: res ? res.totalNo.toString() : '',
    totalStake: res ? res.totalStake.toString() : '',
    totalYes: res ? res.totalYes.toString() : ''
  }

  return ret
}
