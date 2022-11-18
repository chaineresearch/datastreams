import React, { useEffect, useState, ReactElement } from 'react'
import styles from './Conversion.module.css'
import { formatCurrency, isCrypto } from '@coingecko/cryptoformat'
import { useUserPreferences } from '@context/UserPreferences'
import { usePrices, getCoingeckoTokenId } from '@context/Prices'
import { useFormikContext } from 'formik'
import { FormPublishData } from 'src/components/Publish/_types'

export const UnformattedConvertedPrice = () => {
  const { prices } = usePrices()
  const { currency, locale } = useUserPreferences()
  const [priceConverted, setPriceConverted] = useState(0.0)
  const [priceConvertedJson, setPriceConvertedJson] = useState(null)
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  useEffect(() => {
    const symbol = values?.pricing?.baseToken?.symbol
    const priceTokenId = getCoingeckoTokenId(symbol)

    if (
      !prices ||
      !symbol ||
      !priceTokenId ||
      !prices[priceTokenId] ||
      !values
    ) {
      return
    }

    const conversionValue = prices[priceTokenId][currency.toLowerCase()]
    const convertedJson = {
      price: prices[priceTokenId][currency.toLowerCase()],
      priceTokenId,
      currency: currency.toLowerCase(),
      locale
    }
    setPriceConverted(conversionValue)
    setPriceConvertedJson(convertedJson)
  }, [prices, currency, values, locale])

  return priceConvertedJson
}

export default function Conversion({
  price,
  symbol,
  className,
  hideApproximateSymbol
}: {
  price: string // expects price in OCEAN, not wei
  symbol: string
  className?: string
  hideApproximateSymbol?: boolean
}): ReactElement {
  const { prices } = usePrices()
  const { currency, locale } = useUserPreferences()
  const savedPrice = JSON.parse(localStorage.getItem('savedPrice'))
  const [priceConverted, setPriceConverted] = useState('0.00')
  const [unformattedPrice, setUnformattedPrice] = useState(savedPrice || '0.00')

  localStorage.setItem('savedPrice', JSON.stringify(unformattedPrice))
  // detect fiat, only have those kick in full @coingecko/cryptoformat formatting
  const isFiat = !isCrypto(currency)
  // isCrypto() only checks for BTC & ETH & unknown but seems sufficient for now
  // const isFiat = /(EUR|USD|CAD|SGD|HKD|CNY|JPY|GBP|INR|RUB)/g.test(currency)

  // referring to Coingecko tokenId in Prices context provider
  const priceTokenId = getCoingeckoTokenId(symbol)

  useEffect(() => {
    if (
      !prices ||
      !price ||
      price === '0' ||
      !priceTokenId ||
      !prices[priceTokenId]
    ) {
      return
    }

    const conversionValue = prices[priceTokenId][currency.toLowerCase()]
    const converted = conversionValue * Number(price)
    setUnformattedPrice(conversionValue.toFixed(2))
    const convertedFormatted = formatCurrency(
      converted,
      // No passing of `currency` for non-fiat so symbol conversion
      // doesn't get triggered.
      isFiat ? currency : '',
      locale,
      false,
      { decimalPlaces: 2 }
    )
    // It's a hack! Wrap everything in the string which is not a number or `.` or `,`
    // with a span for consistent visual symbol formatting.
    const convertedFormattedHTMLstring = convertedFormatted.replace(
      /([^.,0-9]+)/g,
      (match) => `<span>${match}</span>`
    )
    console.log({
      prices,
      priceTokenId,
      currency,
      locale,
      converted,
      conversionValue,
      convertedFormatted,
      convertedFormattedHTMLstring
    })
    setPriceConverted(convertedFormattedHTMLstring)
  }, [price, prices, currency, locale, isFiat, priceTokenId])

  // useEffect(() => {
  //   console.log({ price, prices, priceConverted })
  // }, [price, prices, currency, locale, isFiat, priceTokenId])

  return Number(price) > 0 ? (
    <span
      className={`${styles.conversion} ${className || ''}`}
      title="Approximation based on the current spot price on Coingecko"
    >
      {!hideApproximateSymbol && '≈ '}
      <strong dangerouslySetInnerHTML={{ __html: priceConverted }} />{' '}
      {!isFiat && currency}
    </span>
  ) : null
}
