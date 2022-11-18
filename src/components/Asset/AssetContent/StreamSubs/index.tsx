/* eslint-disable prettier/prettier */
import { useAsset } from '@context/Asset'
import React, { useEffect } from 'react'
import styles from './index.module.css'
import { LoggerInstance } from '@oceanprotocol/lib'
import { endpointTruncate } from '@utils/web3'
import Input from '@shared/FormInput'

export default function StreamSubs() {
  // const { values } = useFormikContext<FormPublishData>()
  const { asset } = useAsset()
  const endpointFormatted = endpointTruncate(asset)

  useEffect(() => {
    LoggerInstance.log('asset_:', asset)
  }, [asset])

  return (
    asset?.metadata.type === 'datastream' && (
      <>
        <div>
          {/* <SubsPriceUnit /> */}
          {/* <MetaSubsPrice /> */}
        </div>
        <div className={styles.stats}>
          {/* <MetaSubsPrice ddo={asset} /> */}
          <label className={styles.label}>Datastream EndPoint</label>
          <section className={styles.endpoint}>
            <Input
              type="text"
              value={endpointFormatted}
              // readOnly={true}
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onChange={() => {}}
            />
          </section>
        </div>
      </>
    )
  )
}
