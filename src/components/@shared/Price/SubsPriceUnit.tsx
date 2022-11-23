/* eslint-disable prettier/prettier */
import * as React from 'react'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import { grey, pink } from '@mui/material/colors'
import { useAsset } from '@context/Asset'
import { formatCurrency, isCrypto } from '@coingecko/cryptoformat'
import { useUserPreferences } from '@context/UserPreferences'
import styles from './PriceUnit.module.css'

export default function SubsPriceUnit(): React.ReactElement {
  const savedSelect = JSON.parse(localStorage.getItem('selectedTimedValues'))
  const savedSelectConv = JSON.parse(localStorage.getItem('selectedTimedConv'))
  const savedPrice = JSON.parse(localStorage.getItem('savedPrice'))

  const [selectedValue, setSelectedValue] = React.useState(savedSelect || '0')

  const [selectedSubs, setSelectedSubs] = React.useState(savedSelectConv || '')
  const { asset } = useAsset()
  const { currency, locale } = useUserPreferences()

  const savedItem = JSON.parse(localStorage.getItem('timedValues'))

  localStorage.setItem('selectedTimedValues', JSON.stringify(selectedValue))
  localStorage.setItem('selectedTimedConv', JSON.stringify(selectedSubs))

  React.useEffect(() => {
    console.log({ savedPrice })
  }, [savedPrice])

  const _handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
  }

  const controlProps = (item: string) => ({
    // eslint-disable-next-line eqeqeq
    checked: selectedValue == item,
    onChange: _handleChange,
    value: item,
    name: 'color-radio-button-demo',
    inputProps: { 'aria-label': item }
    // color: "success"
  })

  console.log({ selectedValue, selectedSubs, asset })

  // const variants = {
  //   variations: [
  //     {
  //       variation_id: 1,
  //       variation_name: "210kr",
  //       price: "210",
  //       reward_text: "200kr. Price",
  //       reward_description:
  //         "Med et gavekort til Sendentanke.dk kan du vælge mellem gavekort til hundredevis af butikker og oplevelser ét sted.",
  //     },
  //     {
  //       variation_id: 2,
  //       variation_name: "400kro",
  //       price: "400",
  //       reward_text: "400 Price",
  //       reward_description: "Earn a reward",
  //     },
  //   ],
  // };

  // console.log({ giftCard, giftDescription })

  // const Options = variants.variations.map((v, index) => (
  //   // eslint-disable-next-line react/jsx-key
  //   <div key={index} >
  //     <input
  //       key={v.variation_id}
  //       type="radio"
  //       value={v.variation_id}
  //       checked={v.variation_id == giftCard}
  //       onChange={(e) => {
  //         e.preventDefault()
  //         // console.log({ giftCard: e.target.value, giftDescription: v.reward_description })
  //         setGiftCard(e.target.value)
  //         setGiftDescription(v.reward_description)

  //       }}
  //     />
  //     {v.reward_text}
  //   </div>
  // )
  //   // return (
  //   // eslint-disable-next-line react/jsx-key
  //   // <div>
  //   //   <input
  //   //     key={v.variation_id}
  //   //     type="radio"
  //   //     value={v.variation_id}
  //   //     checked={v.variation_id === giftCard}
  //   //     onChange={(e) => {
  //   //       console.log({ giftCard: e.target.value, giftDescription: v.reward_description })
  //   //       setGiftCard(e.target.value)
  //   //       setGiftDescription(v.reward_description)
  //   //     }}
  //   //   />
  //   //   {v.reward_text}
  //   // </div>
  //   //  const _Options = variants.variations.map((val, index) => val)
  //   //  const variationId = variants.variations.map((val, index) => val.variation_id)
  //   //  const variationName = variants.variations.map((val, index) => val.variation_name)
  //   //  const rewardText = variants.variations.map((val, index) => val.reward_text)
  //   //  const rewardDescr = variants.variations.map((val, index) => val.reward_description)
  //   //  const variationPrice = variants.variations.map((val, index) => val.price)

  //   // );
  // );

  // return (
  //   <div>
  //     {Options}
  //     <p>{giftDescription}</p>
  //   </div>
  // );

  // // return (
  // //   <FormControl>
  // //     {/* <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel> */}
  // //     <RadioGroup
  // //       aria-labelledby="demo-radio-buttons-group-label"
  // //       // defaultValue="female"
  // //       name="radio-buttons-group"
  // //       value={value}
  // //       onChange={handleChange}
  // //     >
  // //       <FormControlLabel value="female" control={<Radio />} label="Female" />
  // //       <FormControlLabel value="male" control={<Radio />} label="Male" />
  // //       <FormControlLabel value="other" control={<Radio />} label="Other" />
  // //     </RadioGroup>
  // //   </FormControl>
  // // );

  const subOptions = savedItem.map(
    (
      value: {
        price: number
        id: string
        unit: number
        time: string
      },
      index: string
    ) => {
      const symbol = asset?.accessDetails?.baseToken?.symbol
      const isFiat = !isCrypto(currency)
      const labelUnit = value.unit.toFixed(0)
      const labelPrice = value.price.toFixed(0)

      const formattedCurrencySymbol = formatCurrency(
        Number(labelPrice) * Number(labelUnit) * Number(savedPrice),
        isFiat ? currency : '',
        locale,
        false,
        { decimalPlaces: 2 }
      )
      console.log(labelPrice, labelUnit, value.time)

      return (
        <div key={index}>
          <FormControl sx={{ m: -0.2 }} variant="standard">
            <RadioGroup
              aria-labelledby="demo-error-radios"
              name={value.id}
              value={selectedValue}
              onChange={(e) => {
                setSelectedSubs(formattedCurrencySymbol)
              }}
            >
              <FormControlLabel
                value={index}
                control={
                  <Radio
                    {...controlProps(index)}
                    sx={{
                      color: grey[600],
                      '&.Mui-checked': {
                        color: pink[600]
                      }
                    }}
                  />
                }
                label={`${labelUnit} ${value.time} / ${labelPrice} OCEAN ≈ ${formattedCurrencySymbol}`}
              />
            </RadioGroup>
          </FormControl>
        </div>
      )
    }
  )

  return <React.Fragment>{subOptions}</React.Fragment>
}
