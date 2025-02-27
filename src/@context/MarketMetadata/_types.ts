export interface OpcFee {
  chainId: number
  swapNotApprovedFee: string
  swapApprovedFee: string
  approvedTokens: string[]
}

export interface AppConfig {
  metadataCacheUri: string
  infuraProjectId: string
  chainIds: number[]
  chainIdsSupported: number[]
  marketFeeAddress: string
  publisherMarketOrderFee: string
  publisherMarketFixedSwapFee: string
  consumeMarketOrderFee: string
  consumeMarketFixedSwapFee: string
  currencies: string[]
  coingeckoTokenIds: string[]
  allowFixedPricing: string
  allowFreePricing: string
  defaultPrivacyPolicySlug: string
  privacyPreferenceCenter: string
  darkModeConfig: {
    classNameDark: string
    classNameLight: string
    storageKey: string
  }
  v3MetadataCacheUri: string
  v3MarketUri: string
}
export interface SiteContent {
  siteTitle: string
  siteTagline: string
  siteUrl: string
  siteImage: string
  copyright: string
  menu: {
    name: string
    link: string
  }[]
  announcement: string
  warning: {
    ctd: string
    stream: string
  }
}

export interface MarketMetadataProviderValue {
  opcFees: OpcFee[]
  siteContent: SiteContent
  appConfig: AppConfig
  getOpcFeeForToken: (tokenAddress: string, chainId: number) => string
}
