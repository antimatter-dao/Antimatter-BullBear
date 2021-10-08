import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn, ColumnCenter } from 'components/Column'
import Modal from '.'
import { TYPE } from 'theme'
import { Checkbox } from '../SearchModal/styleds'
import { AutoRow } from '../Row'
import useTheme from '../../hooks/useTheme'
import { transparentize } from 'polished'
import Card from '../Card'

const STORAGE_KEY = 'isWarningModalShown'

export default function WarningModal() {
  const theme = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [enableCheck, setEnableCheck] = useState(false)

  const confirmRef = useRef<HTMLDivElement>()

  const isDev = process.env.NODE_ENV === 'development'

  const handleClose = useCallback(() => {
    setIsOpen(false)
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        expiry: new Date().getTime() + 604800000
      })
    )
  }, [setIsOpen])

  useEffect(() => {
    if (!window || !window?.localStorage) {
      return
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      setIsOpen(true)
    } else {
      const { expiry } = JSON.parse(stored)
      const now = new Date().getTime()
      if (now > expiry) {
        setIsOpen(true)
        return
      }
    }
  }, [])
  return (
    <>
      {!isDev && (
        <Modal maxWidth={608} isOpen={isOpen} onDismiss={() => {}}>
          <AutoColumn
            gap="24px"
            style={{
              margin: 32,
              overflow: 'auto'
            }}
          >
            <ColumnCenter>
              <div /> <TYPE.mediumHeader style={{ textAlign: 'center' }}>Warning!</TYPE.mediumHeader>
              {/*<X onClick={handleClose} style={{ cursor: 'pointer' }} />*/}
            </ColumnCenter>

            <Card
              onScrollCapture={e => {
                if (confirmRef.current && confirmRef.current.scrollHeight - confirmRef.current.scrollTop < 420) {
                  setEnableCheck(true)
                }
              }}
              ref={confirmRef}
              maxHeight={320}
              overflow={'auto'}
              style={{ backgroundColor: transparentize(0.8, theme.primary1) }}
            >
              <TYPE.body>
                Please note.The dapp is only open to non-U.S. persons and entities. All registrants must meet
                eligibility requirements to participate.
                <br />
                <br />
                The dapp is not and will not be offered or sold, directly or indirectly, to any person who is a
                resident, organized, or located in any country or territory subject to OFAC comprehensive sanctions
                programs from time to time, including Cuba, Crimea region of Ukraine, Democratic people’s Republic of
                Korea, Iran, Syria, any person found on the OFAC specially designated nationals, blocked persons list,
                any other consolidated prohibited persons list as determined by any applicable governmental authority.
                <br />
                <br />
                PLEASE READ THE ENTIRETY OF THIS "NOTICE AND DISCLAIMER" SECTION CAREFULLY. NOTHING HEREIN CONSTITUTES
                LEGAL, FINANCIAL, BUSINESS OR TAX ADVICE AND YOU SHOULD CONSULT YOUR OWN LEGAL, FINANCIAL, TAX OR OTHER
                PROFESSIONAL ADVISOR(S) BEFORE ENGAGING IN ANY ACTIVITY IN CONNECTION HEREWITH. NEITHER ANTIMATTER DAO
                LIMITED (THE COMPANY), ANY OF THE PROJECT TEAM MEMBERS (THE ANTIMATTER TEAM) WHO HAVE WORKED ON
                ANTIMATTER (AS DEFINED HEREIN) OR PROJECT TO DEVELOP ANTIMATTER IN ANY WAY WHATSOEVER, ANY
                DISTRIBUTOR/VENDOR OF MATTER TOKENS (THE DISTRIBUTOR), NOR ANY SERVICE PROVIDER SHALL BE LIABLE FOR ANY
                KIND OF DIRECT OR INDIRECT DAMAGE OR LOSS WHATSOEVER WHICH YOU MAY SUFFER IN CONNECTION WITH ACCESSING
                THIS WHITEPAPER, THE WEBSITE AT HTTPS://ANTIMATTER.FINANCE/ (THE WEBSITE) OR ANY OTHER WEBSITES OR
                MATERIALS PUBLISHED BY THE COMPANY.
                <br />
                <br />
                Project purpose: You agree that you are acquiring MATTER to participate in Antimatter and to obtain
                services on the ecosystem thereon. The Company, the Distributor and their respective affiliates would
                develop and contribute to the underlying source code for Antimatter. The Company is acting solely as an
                arms’ length third party in relation to the MATTER distribution, and not in the capacity as a financial
                advisor or fiduciary of any person with regard to the distribution of MATTER.
                <br />
                <br />
                Nature of the Whitepaper: The Whitepaper and the Website are intended for general informational purposes
                only and do not constitute a prospectus, an offer document, an offer of securities, a solicitation for
                investment, or any offer to sell any product, item, or asset (whether digital or otherwise). The
                information herein may not be exhaustive and does not imply any element of a contractual relationship.
                There is no assurance as to the accuracy or completeness of such information and no representation,
                warranty or undertaking is or purported to be provided as to the accuracy or completeness of such
                information. Where the Whitepaper or the Website includes information that has been obtained from third
                party sources, the Company, the Distributor, their respective affiliates and/or the Antimatter team have
                not independently verified the accuracy or completeness of such information. Further, you acknowledge
                that circumstances may change and that the Whitepaper or the Website may become outdated as a result;
                and neither the Company nor the Distributor is under any obligation to update or correct this document
                in connection therewith.
                <br />
                <br />
                Token Documentation: Nothing in the Whitepaper or the Website constitutes any offer by the Company, the
                Distributor, or the Antimatter team to sell any MATTER (as defined herein) nor shall it or any part of
                it nor the fact of its presentation form the basis of, or be relied upon in connection with, any
                contract or investment decision. Nothing contained in the Whitepaper or the Website is or may be relied
                upon as a promise, representation or undertaking as to the future performance of Antimatter. The
                agreement between the Distributor (or any third party) and you, in relation to any distribution or
                transfer of MATTER, is to be governed only by the separate terms and conditions of such agreement.
                <br />
                <br />
                The information set out in the Whitepaper and the Website is for community discussion only and is not
                legally binding. No person is bound to enter into any contract or binding legal commitment in relation
                to the acquisition of MATTER, and no digital asset or other form of payment is to be accepted on the
                basis of the Whitepaper or the Website. The agreement for distribution of MATTER and/or continued
                holding of MATTER shall be governed by a separate set of Terms and Conditions or Token Distribution
                Agreement (as the case may be) setting out the terms of such distribution and/or continued holding of
                MATTER (the Terms and Conditions), which shall be separately provided to you or made available on the
                Website. The Terms and Conditions must be read together with the Whitepaper. In the event of any
                inconsistencies between the Terms and Conditions and the Whitepaper or the Website, the Terms and
                Conditions shall prevail.
                <br />
                <br />
                Deemed Representations and Warranties: By accessing the Whitepaper or the Website (or any part thereof),
                you shall be deemed to represent and warrant to the Company, the Distributor, their respective
                affiliates, and the Antimatter team as follows:
                <br />
                <br />
                <ul>
                  <li>
                    in any decision to acquire any MATTER, you have shall not rely on any statement set out in the
                    Whitepaper or the Website;
                  </li>
                  <li>
                    you will and shall at your own expense ensure compliance with all laws, regulatory requirements and
                    restrictions applicable to you (as the case may be);
                  </li>
                  <li>
                    you acknowledge, understand and agree that MATTER may have no value, there is no guarantee or
                    representation of value or liquidity for MATTER, and MATTER is not an investment product nor is it
                    intended for any speculative investment whatsoever;
                  </li>
                  <li>
                    none of the Company, the Distributor, their respective affiliates, and/or the Antimatter team
                    members shall be responsible for or liable for the value of MATTER, the transferability and/or
                    liquidity of MATTER and/or the availability of any market for MATTER through third parties or
                    otherwise; and
                  </li>
                  <li>
                    you acknowledge, understand and agree that you are not eligible to participate in the distribution
                    of MATTER if you are a citizen, national, resident (tax or otherwise), domiciliary and/or green card
                    holder of a geographic area or country (i) where it is likely that the distribution of MATTER would
                    be construed as the sale of a security (howsoever named), financial service or investment product
                    and/or (ii) where participation in token distributions is prohibited by applicable law, decree,
                    regulation, treaty, or administrative act (including without limitation the United States of America
                    and the People's Republic of China); and to this effect you agree to provide all such identity
                    verification document when requested in order for the relevant checks to be carried out.
                  </li>
                </ul>
                <br />
                <br />
                The Company, the Distributor and the Antimatter team do not and do not purport to make, and hereby
                disclaims, all representations, warranties or undertaking to any entity or person (including without
                limitation warranties as to the accuracy, completeness, timeliness, or reliability of the contents of
                the Whitepaper or the Website, or any other materials published by the Company or the Distributor). To
                the maximum extent permitted by law, the Company, the Distributor, their respective affiliates and
                service providers shall not be liable for any indirect, special, incidental, consequential or other
                losses of any kind, in tort, contract or otherwise (including, without limitation, any liability arising
                from default or negligence on the part of any of them, or any loss of revenue, income or profits, and
                loss of use or data) arising from the use of the Whitepaper or the Website, or any other materials
                published, or its contents (including without limitation any errors or omissions) or otherwise arising
                in connection with the same. Prospective acquirors of MATTER should carefully consider and evaluate all
                risks and uncertainties (including financial and legal risks and uncertainties) associated with the
                distribution of MATTER, the Company, the Distributor and the Antimatter team.
                <br />
                <br />
                MATTER Token: MATTER are designed to be utilised, and that is the goal of the MATTER distribution. In
                fact, the project to develop Antimatter would fail if all MATTER holders simply held onto their MATTER
                and did nothing with it. In particular, it is highlighted that MATTER:
                <br />
                <br />
                <ul>
                  <li>
                    does not have any tangible or physical manifestation, and does not have any intrinsic value (nor
                    does any person make any representation or give any commitment as to its value);
                  </li>
                  <li>
                    is non-refundable and cannot be exchanged for cash (or its equivalent value in any other digital
                    asset) or any payment obligation by the Company, the Distributor or any of their respective
                    affiliates;
                  </li>
                  <li>
                    does not represent or confer on the token holder any right of any form with respect to the Company,
                    the Distributor (or any of their respective affiliates), or its revenues or assets, including
                    without limitation any right to receive future dividends, revenue, shares, ownership right or stake,
                    share or security, any voting, distribution, redemption, liquidation, proprietary (including all
                    forms of intellectual property or licence rights), right to receive accounts, financial statements
                    or other financial data, the right to requisition or participate in shareholder meetings, the right
                    to nominate a director, or other financial or legal rights or equivalent rights, or intellectual
                    property rights or any other form of participation in or relating to Antimatter, the Company, the
                    Distributor and/or their service providers;
                  </li>
                  <li>
                    is not intended to represent any rights under a contract for differences or under any other contract
                    the purpose or pretended purpose of which is to secure a profit or avoid a loss;
                  </li>
                  <li>
                    is not intended to be a representation of money (including electronic money), security, commodity,
                    bond, debt instrument, unit in a collective investment scheme or any other kind of financial
                    instrument or investment;
                  </li>
                  <li>
                    is not a loan to the Company, the Distributor or any of their respective affiliates, is not intended
                    to represent a debt owed by the Company, the Distributor or any of their respective affiliates, and
                    there is no expectation of profit; and
                  </li>
                  <li>
                    does not provide the token holder with any ownership or other interest in the Company, the
                    Distributor or any of their respective affiliates.
                  </li>
                </ul>
                <br />
                <br />
                Notwithstanding the MATTER distribution, users have no economic or legal right over or beneficial
                interest in the assets of the Company, the Distributor, or any of their affiliates after the token
                distribution.
                <br />
                <br />
                To the extent a secondary market or exchange for trading MATTER does develop, it would be run and
                operated wholly independently of the Company, the Distributor, the distribution of MATTER and
                Antimatter. Neither the Company nor the Distributor will create such secondary markets nor will either
                entity act as an exchange for MATTER.
                <br />
                <br />
                Informational purposes only: The information set out herein is only conceptual, and describes the future
                development goals for Antimatter to be developed. In particular, the project roadmap in the Whitepaper
                is being shared in order to outline some of the plans of the Antimatter team, and is provided solely for
                INFORMATIONAL PURPOSES and does not constitute any binding commitment. Please do not rely on this
                information in deciding whether to participate in the token distribution because ultimately, the
                development, release, and timing of any products, features or functionality remains at the sole
                discretion of the Company, the Distributor or their respective affiliates, and is subject to change.
                Further, the Whitepaper or the Website may be amended or replaced from time to time. There are no
                obligations to update the Whitepaper or the Website, or to provide recipients with access to any
                information beyond what is provided herein.
                <br />
                <br />
                Regulatory approval: No regulatory authority has examined or approved, whether formally or informally,
                any of the information set out in the Whitepaper or the Website. No such action or assurance has been or
                will be taken under the laws, regulatory requirements or rules of any jurisdiction. The publication,
                distribution or dissemination of the Whitepaper or the Website does not imply that the applicable laws,
                regulatory requirements or rules have been complied with.
                <br />
                <br />
                Cautionary Note on forward-looking statements: All statements contained herein, statements made in press
                releases or in any place accessible by the public and oral statements that may be made by the Company,
                the Distributor and/or the Antimatter team, may constitute forward-looking statements (including
                statements regarding the intent, belief or current expectations with respect to market conditions,
                business strategy and plans, financial condition, specific provisions and risk management practices).
                You are cautioned not to place undue reliance on these forward-looking statements given that these
                statements involve known and unknown risks, uncertainties and other factors that may cause the actual
                future results to be materially different from that described by such forward-looking statements, and no
                independent third party has reviewed the reasonableness of any such statements or assumptions. These
                forward-looking statements are applicable only as of the date indicated in the Whitepaper, and the
                Company, the Distributor as well as the Antimatter team expressly disclaim any responsibility (whether
                express or implied) to release any revisions to these forward-looking statements to reflect events after
                such date.
                <br />
                <br />
                References to companies and platforms: The use of any company and/or platform names or trademarks herein
                (save for those which relate to the Company, the Distributor or their respective affiliates) does not
                imply any affiliation with, or endorsement by, any third party. References in the Whitepaper or the
                Website to specific companies and platforms are for illustrative purposes only.
                <br />
                <br />
                English language: The Whitepaper and the Website may be translated into a language other than English
                for reference purpose only and in the event of conflict or ambiguity between the English language
                version and translated versions of the Whitepaper or the Website, the English language versions shall
                prevail. You acknowledge that you have read and understood the English language version of the
                Whitepaper and the Website.
                <br />
                <br />
                No Distribution: No part of the Whitepaper or the Website is to be copied, reproduced, distributed or
                disseminated in any way without the prior written consent of the Company or the Distributor. By
                attending any presentation on this Whitepaper or by accepting any hard or soft copy of the Whitepaper,
                you agree to be bound by the foregoing limitations.
                <br />
                <br />
                Risks: Antimatter is currently in the initial development stages and there are a variety of
                unforeseeable risks. You acknowledge and agree that there are numerous risks associated with acquiring
                MATTER, holding MATTER, and using MATTER for participation in Antimatter. In the worst scenario, this
                could lead to the loss of all or part of MATTER held. IF YOU DECIDE TO ACQUIRE MATTER OR PARTICIPATE IN
                ANTIMATTER, YOU EXPRESSLY ACKNOWLEDGE, ACCEPT AND ASSUME THE FOLLOWING RISKS:
                <br />
                <br />
                <ul>
                  <li>
                    the regulatory status of Antimatter, MATTER and distributed ledger technology is unclear or
                    unsettled in many jurisdictions. The regulation of digital assets has become a primary target of
                    regulation in all major countries in the world. It is impossible to predict how, when or whether
                    regulatory agencies may apply existing regulations or create new regulations with respect to such
                    technology and its applications, including MATTER and/or Antimatter. Regulatory actions could
                    negatively impact MATTER and/or Antimatter in various ways. The Company, the Distributor (or their
                    respective affiliates) may cease operations in a jurisdiction in the event that regulatory actions,
                    or changes to law or regulation, make it illegal to operate in such jurisdiction, or commercially
                    undesirable to obtain the necessary regulatory approval(s) to operate in such jurisdiction. After
                    consulting with a wide range of legal advisors to mitigate the legal risks as much as possible, the
                    Company and Distributor have worked with the specialist blockchain department at Bayfront Law LLC
                    and obtained a legal opinion on the token distribution, and will be conducting business in
                    accordance with the prevailing market practice;
                  </li>
                  <li>
                    as at the date hereof, Antimatter is still under development and its design concepts, consensus
                    mechanisms, algorithms, codes, and other technical details and parameters may be constantly and
                    frequently updated and changed. Although this whitepaper contains the most current information
                    relating to Antimatter, it is not absolutely complete and may still be adjusted and updated by the
                    Antimatter team from time to time. The Antimatter team has neither the ability nor obligation to
                    keep holders of MATTER informed of every detail (including development progress and expected
                    milestones) regarding the project to develop Antimatter, hence insufficient information disclosure
                    is inevitable and reasonable;
                  </li>
                  <li>
                    various types of decentralised applications and networks are emerging at a rapid rate, and the
                    industry is increasingly competitive. It is possible that alternative networks could be established
                    that utilise the same or similar code and protocol underlying MATTER and/or Antimatter and attempt
                    to re-create similar facilities. Antimatter may be required to compete with these alternative
                    networks, which could negatively impact MATTER and/or Antimatter;
                  </li>
                  <li>
                    the development of Antimatter greatly depends on the continued co-operation of the existing
                    technical team and expert consultants, who are highly knowledgeable and experienced in their
                    respective sectors. The loss of any member may adversely affect Antimatter or its future
                    development. Further, stability and cohesion within the team is critical to the overall development
                    of Antimatter. There is the possibility that conflict within the team and/or departure of core
                    personnel may occur, resulting in negative influence on the project in the future;
                  </li>
                  <li>
                    there is the risk that the development of Antimatter will not be executed or implemented as planned,
                    for a variety of reasons, including without limitation the event of a decline in the prices of any
                    digital asset, virtual currency or MATTER, unforeseen technical difficulties, and shortage of
                    development funds for activities;
                  </li>
                  <li>
                    hackers or other malicious groups or organisations may attempt to interfere with MATTER and/or
                    Antimatter in a variety of ways, including, but not limited to, malware attacks, denial of service
                    attacks, consensus-based attacks, Sybil attacks, smurfing and spoofing. Furthermore, there is a risk
                    that a third party or a member of the Company, the Distributor or their respective affiliates may
                    intentionally or unintentionally introduce weaknesses into the core infrastructure of MATTER and/or
                    Antimatter, which could negatively affect MATTER and/or Antimatter. Further, the future of
                    cryptography and security innovations are highly unpredictable and advances in cryptography, or
                    technical advances (including without limitation development of quantum computing), could present
                    unknown risks to MATTER and/or Antimatter by rendering ineffective the cryptographic consensus
                    mechanism that underpins that blockchain protocol;
                  </li>
                  <li>
                    in addition, the potential risks briefly mentioned above are not exhaustive and there are other
                    risks (as more particularly set out in the Terms and Conditions) associated with your participation
                    in Antimatter, as well as acquisition of, holding and use of MATTER, including those that the
                    Company or the Distributor cannot anticipate. Such risks may further materialise as unanticipated
                    variations or combinations of the aforementioned risks. You should conduct full due diligence on the
                    Company, the Distributor, their respective affiliates, and the Antimatter team, as well as
                    understand the overall framework, mission and vision for Antimatter prior to participating in the
                    same and/or acquiring MATTER.
                  </li>
                </ul>
              </TYPE.body>
              <TYPE.body>The project is in beta, use at your own risk.</TYPE.body>
            </Card>

            <AutoRow style={{ cursor: 'pointer', width: '100%' }}>
              <Checkbox
                // disabled={!enableCheck}
                name="confirmed"
                type="checkbox"
                checked={confirmed}
                onClick={() => setConfirmed(!confirmed)}
              />
              <TYPE.body
                ml="10px"
                fontSize="16px"
                color={enableCheck ? theme.primary1 : theme.primary4}
                fontWeight={500}
                onClick={() => setConfirmed(!confirmed)}
              >
                I agree
              </TYPE.body>
            </AutoRow>

            {/* <TYPE.small style={{ marginTop: -20 }} color={enableCheck ? 'transparent' : theme.red1}>
              Please read all and scroll down to bottom to confirm{' '}
            </TYPE.small> */}

            <ButtonPrimary disabled={!confirmed} onClick={handleClose}>
              Next
            </ButtonPrimary>
          </AutoColumn>
        </Modal>
      )}
    </>
  )
}
