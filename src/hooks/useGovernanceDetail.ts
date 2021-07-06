import { useGovernanceContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useWeb3React } from '@web3-react/core';

interface GovernanceContent{
  summary: string,
  details: string,
  agreeFor: string,
  againstFor: string
}
interface Users{
  totalNo: string,
  totalStake: string,
  totalYes: string,
}
enum StatusOption {
  Live = 'Live',
  Success = 'Success',
  Faild = 'Faild',
}
interface GovernanceData {
  title: string
  creator: string
  contents: GovernanceContent | undefined,
  timeLeft: string
  voteFor: string
  voteAgainst: string
  totalVotes: string
  status: StatusOption
}

export function useGovernanceDetails (index: string | number | undefined) {
  const contact = useGovernanceContract();
  const proposesRes = useSingleCallResult(contact, 'proposes', [index])
  const resultRes = useSingleCallResult(contact, 'getResult', [index])

  const result = proposesRes.result

  const ret: GovernanceData = {
    title: result ? result.subject : '',
    creator: result ? result.creator: '',
    timeLeft: result ? result.endTime.toString(): '',
    voteFor: result ? result.yes.toString() : '',
    voteAgainst: result ? result.no.toString() : '',
    totalVotes: result ? result.totalStake.toString() : '',
    contents: result ? JSON.parse(result.content) : undefined,
    status: resultRes.result ? resultRes.result.toString() === '1' ? StatusOption.Success : 
    resultRes.result.toString() === '2' ? StatusOption.Faild : StatusOption.Live : StatusOption.Live
  }

  return {data: ret, loading: proposesRes.loading}
}


export function useUserStaking(proposeid: string | number | undefined) :Users {
  const { account } =  useWeb3React()
  const contact = useGovernanceContract();
  const usersRes = useSingleCallResult(contact, 'users', [proposeid, account ?? ''])

  const res =  usersRes.result

  const ret = {
    totalNo: res ? res.totalNo.toString() : '',
    totalStake: res ? res.totalStake.toString() : '',
    totalYes: res ? res.totalYes.toString() : '',
  }

  return ret;
}