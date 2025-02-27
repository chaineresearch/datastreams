import React, { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import ExplorerLink from '@shared/ExplorerLink'
import NetworkName from '@shared/NetworkName'
import Jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import Copy from '@shared/atoms/Copy'
import Blockies from '@shared/atoms/Blockies'
import styles from './Account.module.css'
import { useProfile } from '@context/Profile'
import { accountTruncate } from '@utils/web3'

export default function Account({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { profile } = useProfile()

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {profile?.image ? (
          <img
            src={profile?.image}
            className={styles.image}
            width="96"
            height="96"
          />
        ) : accountId ? (
          <Blockies accountId={accountId} className={styles.image} />
        ) : (
          <Jellyfish className={styles.image} />
        )}
      </figure>

      <div>
        <h3 className={styles.name}>{profile?.name}</h3>
        {accountId && (
          <code
            className={styles.accountId}
            title={profile?.accountEns ? accountId : null}
          >
            {profile?.accountEns || accountId} <Copy text={accountId} />
          </code>
        )}
        <p>
          {accountId &&
            chainIds.map((value) => (
              <ExplorerLink
                className={styles.explorer}
                networkId={value}
                path={`address/${accountId}`}
                key={value}
              >
                <NetworkName networkId={value} />
              </ExplorerLink>
            ))}
        </p>
      </div>
    </div>
  )

  // return (
  //   <div>{accountTruncate('0xDdDc9cEE9f436339fF2d73bbb7Ba1A79715552290b')}</div>
  // )
}
