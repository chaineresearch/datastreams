import React, { ReactElement } from 'react'
import MetaItem from './MetaItem'
import styles from './MetaSecondary.module.css'
import Tags from '@shared/atoms/Tags'
import Button from '@shared/atoms/Button'
import { Asset } from '@oceanprotocol/lib'

const SampleButton = ({ url, ddo }: { url: string; ddo: Asset }) => (
  <Button
    href={url}
    target="_blank"
    rel="noreferrer"
    download
    style="text"
    size="small"
  >
    {ddo?.metadata.type === 'datastream' ? 'View The Docs' : 'Download Sample'}
  </Button>
)
//

export default function MetaSecondary({ ddo }: { ddo: Asset }): ReactElement {
  console.log({ metadata: ddo?.metadata })
  return (
    <aside className={styles.metaSecondary}>
      {ddo?.metadata.links?.length > 0 && (
        <div className={styles.samples}>
          <MetaItem
            title="Sample Data"
            content={
              <SampleButton url={ddo?.metadata.links[0]} ddo={undefined} />
            }
          />
        </div>
      )}
      {ddo?.metadata.type === 'datastream' &&
        ddo?.services[0].docs?.length > 0 && (
          <div className={styles.samples}>
            <MetaItem
              title="DataStream API Documentation"
              content={<SampleButton url={ddo?.services[0].docs} ddo={ddo} />}
            />
          </div>
        )}
      {ddo?.metadata?.tags?.length > 0 && <Tags items={ddo?.metadata?.tags} />}
    </aside>
  )
}
