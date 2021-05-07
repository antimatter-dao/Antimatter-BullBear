export function usePairData(pairAddress) {
  const [state, { update }] = usePairDataContext()
  const [ethPrice] = useEthPrice()
  const pairData = state?.[pairAddress]

  useEffect(() => {
    async function fetchData() {
      if (!pairData && pairAddress) {
        const data = await getBulkPairData([pairAddress], ethPrice)
        data && update(pairAddress, data[0])
      }
    }
    if (!pairData && pairAddress && ethPrice && isAddress(pairAddress)) {
      fetchData()
    }
  }, [pairAddress, pairData, update, ethPrice])

  return pairData || {}
}

async function getBulkPairData(pairList, ethPrice) {
  const [t1, t2, tWeek] = getTimestampsForChanges()
  const [{ number: b1 }, { number: b2 }, { number: bWeek }] = await getBlocksFromTimestamps([t1, t2, tWeek])

  try {
    const current = await client.query({
      query: PAIRS_BULK,
      variables: {
        allPairs: pairList
      },
      fetchPolicy: 'cache-first'
    })

    const [oneDayResult, twoDayResult, oneWeekResult] = await Promise.all(
      [b1, b2, bWeek].map(async block => {
        const result = client.query({
          query: PAIRS_HISTORICAL_BULK(block, pairList),
          fetchPolicy: 'cache-first'
        })
        return result
      })
    )

    const oneDayData = oneDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const twoDayData = twoDayResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const oneWeekData = oneWeekResult?.data?.pairs.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur }
    }, {})

    const pairData = await Promise.all(
      current &&
        current.data.pairs.map(async pair => {
          let data = pair
          let oneDayHistory = oneDayData?.[pair.id]
          if (!oneDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, b1),
              fetchPolicy: 'cache-first'
            })
            oneDayHistory = newData.data.pairs[0]
          }
          let twoDayHistory = twoDayData?.[pair.id]
          if (!twoDayHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, b2),
              fetchPolicy: 'cache-first'
            })
            twoDayHistory = newData.data.pairs[0]
          }
          let oneWeekHistory = oneWeekData?.[pair.id]
          if (!oneWeekHistory) {
            const newData = await client.query({
              query: PAIR_DATA(pair.id, bWeek),
              fetchPolicy: 'cache-first'
            })
            oneWeekHistory = newData.data.pairs[0]
          }
          data = parseData(data, oneDayHistory, twoDayHistory, oneWeekHistory, ethPrice, b1)
          return data
        })
    )
    return pairData
  } catch (e) {
    console.log(e)
  }
}
