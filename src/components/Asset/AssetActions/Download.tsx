import React, { ReactElement, useEffect, useState } from 'react'
import FileIcon from '@shared/FileIcon'
import Price from '@shared/Price'
import { useAsset } from '@context/Asset'
import { useWeb3 } from '@context/Web3'
import ButtonBuy from '@shared/ButtonBuy'
import { secondsToString } from '@utils/ddo'
import AlgorithmDatasetsListForCompute from './Compute/AlgorithmDatasetsListForCompute'
import styles from './Download.module.css'
import { FileInfo, LoggerInstance, ZERO_ADDRESS } from '@oceanprotocol/lib'
import { order } from '@utils/order'
import { downloadFile } from '@utils/provider'
import { getOrderFeedback } from '@utils/feedback'
import { getOrderPriceAndFees } from '@utils/accessDetailsAndPricing'
import { toast } from 'react-toastify'
import { useIsMounted } from '@hooks/useIsMounted'
import { useMarketMetadata } from '@context/MarketMetadata'
import Alert from '@shared/atoms/Alert'
import Loader from '@shared/atoms/Loader'
import IconCopy from '@images/copy.svg'
import SubsPriceUnit from '@shared/Price/SubsPriceUnit'

export default function Download({
  asset,
  file,
  isBalanceSufficient,
  dtBalance,
  fileIsLoading,
  consumableFeedback
}: {
  asset: AssetExtended
  file: FileInfo
  isBalanceSufficient: boolean
  dtBalance: string
  fileIsLoading?: boolean
  consumableFeedback?: string
}): ReactElement {
  const { accountId, web3 } = useWeb3()
  const { getOpcFeeForToken } = useMarketMetadata()
  const { isInPurgatory, isAssetNetwork } = useAsset()
  const isMounted = useIsMounted()

  const [isDisabled, setIsDisabled] = useState(true)
  const [hasDatatoken, setHasDatatoken] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [isOwned, setIsOwned] = useState(false)
  const [validOrderTx, setValidOrderTx] = useState('')
  const [orderPriceAndFees, setOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  // const [isStream, setIsStream] = useState(true)
  const [copySuccess, setCopySuccess] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  const isUnsupportedPricing = asset?.accessDetails?.type === 'NOT_SUPPORTED'
  const { approvedBaseTokens, chainId } = useWeb3()

  useEffect(() => {
    console.log({ checkAsset: asset })
    if (!asset?.accessDetails || isUnsupportedPricing) return

    asset.accessDetails.isOwned && setIsOwned(asset?.accessDetails?.isOwned)
    asset.accessDetails.validOrderTx &&
      setValidOrderTx(asset?.accessDetails?.validOrderTx)

    // get full price and fees
    async function init() {
      if (
        asset.accessDetails.addressOrId === ZERO_ADDRESS ||
        asset.accessDetails.type === 'free' ||
        isLoading
      )
        return

      !orderPriceAndFees && setIsPriceLoading(true)

      const _orderPriceAndFees = await getOrderPriceAndFees(asset, ZERO_ADDRESS)
      setOrderPriceAndFees(_orderPriceAndFees)
      !orderPriceAndFees && setIsPriceLoading(false)
    }

    init()

    /**
     * we listen to the assets' changes to get the most updated price
     * based on the asset and the poolData's information.
     * Not adding isLoading and getOpcFeeForToken because we set these here. It is a compromise
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, accountId, getOpcFeeForToken, isUnsupportedPricing])

  useEffect(() => {
    setHasDatatoken(Number(dtBalance) >= 1)
  }, [dtBalance])

  useEffect(() => {
    // LoggerInstance.log({
    //   // purchasable: asset?.accessDetails.isPurchasable,
    //   isAssetNetwork,
    //   isBalanceSufficient,
    //   isOwned,
    //   hasDatatoken,
    //   validOrderTx
    // })
    if (
      (asset?.accessDetails?.type === 'fixed' && !orderPriceAndFees) ||
      !isMounted ||
      !accountId ||
      !asset?.accessDetails ||
      isUnsupportedPricing
    )
      return

    /**
     * disabled in these cases:
     * - if the asset is not purchasable
     * - if the user is on the wrong network
     * - if user balance is not sufficient
     * - if user has no datatokens
     */

    const isDisabled =
      !asset?.accessDetails.isPurchasable ||
      !isAssetNetwork ||
      ((!isBalanceSufficient || !isAssetNetwork) && !isOwned && !hasDatatoken)

    setIsDisabled(isDisabled)
  }, [
    isMounted,
    asset?.accessDetails,
    isBalanceSufficient,
    isAssetNetwork,
    hasDatatoken,
    accountId,
    isOwned,
    isUnsupportedPricing,
    orderPriceAndFees
  ])

  // Clear copy success style after 5 sec.
  useEffect(() => {
    if (!isCopied) return

    const timeout = setTimeout(() => {
      setIsCopied(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [isCopied])

  async function handleOrderOrDownload() {
    setIsLoading(true)

    try {
      if (isOwned && !asset.services[0].streamFiles) {
        LoggerInstance.log('Yep')
        setStatusText(
          getOrderFeedback(
            asset.accessDetails.baseToken?.symbol,
            asset.accessDetails.datatoken?.symbol
          )[3]
        )

        await downloadFile(web3, asset, accountId, validOrderTx)
      } else if (isOwned && asset.services[0].streamFiles) {
        await navigator.clipboard.writeText(asset.services[0].streamFiles)
        setCopySuccess('Stream Link Copied!')
        setIsCopied(true)
        LoggerInstance.log('Yeppp Copied!', asset.services[0].streamFiles)
      } else {
        setStatusText(
          getOrderFeedback(
            asset.accessDetails.baseToken?.symbol,
            asset.accessDetails.datatoken?.symbol
          )[asset.accessDetails.type === 'fixed' ? 2 : 1]
        )
        const orderTx = await order(web3, asset, orderPriceAndFees, accountId)
        if (!orderTx) {
          throw new Error()
        }
        setIsOwned(true)
        setValidOrderTx(orderTx.transactionHash)
      }
    } catch (error) {
      LoggerInstance.error(error)
      const message = isOwned
        ? 'Failed to download file!'
        : 'An error occurred. Check console for more information.'
      toast.error(message)
    }
    setIsLoading(false)
  }

  const PurchaseButton = () => (
    <ButtonBuy
      action={asset?.metadata?.type === 'datastream' ? 'stream' : 'download'}
      disabled={isDisabled}
      hasPreviousOrder={isOwned}
      hasDatatoken={hasDatatoken}
      btSymbol={asset?.accessDetails?.baseToken?.symbol}
      dtSymbol={asset?.datatokens[0]?.symbol}
      dtBalance={dtBalance}
      onClick={handleOrderOrDownload}
      assetTimeout={secondsToString(asset.services[0].timeout)}
      assetType={asset?.metadata?.type}
      stepText={statusText}
      copyText={
        asset?.metadata.type === 'datastream' && asset.services[0].streamFiles
      }
      isLoading={isLoading}
      priceType={asset.accessDetails?.type}
      isConsumable={asset.accessDetails?.isPurchasable}
      isStreamble={asset.accessDetails?.isPurchasable}
      isBalanceSufficient={isBalanceSufficient}
      consumableFeedback={consumableFeedback}
    />
  )

  const AssetAction = ({ asset }: { asset: AssetExtended }) => {
    return (
      <div>
        {isUnsupportedPricing ? (
          <Alert
            className={styles.fieldWarning}
            state="info"
            text={`No pricing schema available for this asset.`}
          />
        ) : (
          <>
            {isPriceLoading ? (
              <Loader message="Calculating full price (including fees)" />
            ) : (
              <Price
                accessDetails={asset.accessDetails}
                orderPriceAndFees={orderPriceAndFees}
                conversion
                size="large"
              />
            )}
            {asset?.metadata?.type === 'datastream' && <SubsPriceUnit />}
            {!isInPurgatory && <PurchaseButton />}
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.filewrapper}>
        <FileIcon file={file} isLoading={fileIsLoading} small />
      </div>
      <aside className={styles.consume}>
        <div className={styles.info}>
          <AssetAction asset={asset} />
        </div>
        {/* {asset?.metadata.type === 'datastream' && <span>{copySuccess}</span>} */}
        {asset?.metadata.type === 'datastream' && isCopied && (
          <div className={styles.action}>
            {/* <IconCopy className={styles.icon} /> */}
            {<span className={styles.copyfeedback}>{copySuccess}</span>}
          </div>
        )}
        {asset?.metadata?.type === 'algorithm' && (
          <AlgorithmDatasetsListForCompute
            algorithmDid={asset.id}
            asset={asset}
          />
        )}
      </aside>
    </>
  )
}
