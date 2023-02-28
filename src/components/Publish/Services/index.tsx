import Input from '@shared/FormInput'
import { Field, useFormikContext } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'
import IconDownload from '@images/download.svg'
import IconCompute from '@images/compute.svg'
import IconStream from '@images/stream.svg'
import content from '../../../../content/publish/form.json'
import { getFieldContent } from '@utils/form'
import { FormPublishData } from '../_types'
import Alert from '@shared/atoms/Alert'
import { useMarketMetadata } from '@context/MarketMetadata'
import styles from '../index.module.css'

const accessTypeOptionsTitles = getFieldContent(
  'access',
  content.services.fields
).options

export default function ServicesFields(): ReactElement {
  const { siteContent } = useMarketMetadata()

  // connect with Form state, use for conditional field rendering
  const { values, setFieldValue } = useFormikContext<FormPublishData>()

  // name and title should be download, but option value should be access, probably the best way would be to change the component so that option is an object like {name,value}
  const accessTypeOptions = [
    {
      name: 'download',
      value: accessTypeOptionsTitles[0].toLowerCase(),
      title: 'Download',
      icon: <IconDownload />,
      // BoxSelection component is not a Formik component
      // so we need to handle checked state manually.
      checked:
        values.services[0].access === accessTypeOptionsTitles[0].toLowerCase()
    },
    {
      name: accessTypeOptionsTitles[1].toLowerCase(),
      value: accessTypeOptionsTitles[1].toLowerCase(),
      title: accessTypeOptionsTitles[1],
      icon: <IconCompute />,
      checked:
        values.services[0].access === accessTypeOptionsTitles[1].toLowerCase()
    },
    {
      name: accessTypeOptionsTitles[2].toLowerCase(),
      value: accessTypeOptionsTitles[2].toLowerCase(),
      title: accessTypeOptionsTitles[2],
      icon: <IconStream />,
      checked:
        values.services[0].access === accessTypeOptionsTitles[2].toLowerCase()
    }
  ]
  const [endpointHelp, setEndpointHelp] = useState('')
  const [docsHelp, setDocsHelp] = useState('')
  const [endPointLabel, setEndpointLabel] = useState('')
  const [docsLabel, setDocsLabel] = useState('')
  const [docsPlaceholder, setDocsPlaceholder] = useState('')

  console.log({
    names: content.services.fields.map((val) => val)
  })
  useEffect(() => {
    content.services.fields.forEach((val) => {
      if (val?.name === 'links') {
        if (values.metadata.type === 'datastream') {
          setDocsLabel(val?.docsLabel)
          setDocsHelp(val?.docsHelp)
          setDocsPlaceholder(val?.docsPlaceholder)
        } else {
          setDocsLabel(val?.label)
          setDocsHelp(val?.help)
          setDocsPlaceholder(val?.placeholder)
        }
      }
      if (val?.name === 'files') {
        if (values.metadata.type === 'datastream') {
          setEndpointLabel(val?.endpointLabel)
          setEndpointHelp(val?.endpointHelp)
          setDocsPlaceholder(val?.docsPlaceholder)
        } else {
          setEndpointLabel(val?.label)
          setEndpointHelp(val?.help)
          setDocsPlaceholder(val?.placeholder)
        }
      }
    })
  }, [values])

  useEffect(() => {
    if (values.metadata.type === 'datastream') {
      setFieldValue('services[0].timeout', 'Use timed pricing')
    }
  }, [setFieldValue, values])

  // Auto-change access type based on algo privacy boolean.
  // Could be also done later in transformPublishFormToDdo().
  useEffect(() => {
    if (
      values.services[0].algorithmPrivacy === null ||
      values.services[0].algorithmPrivacy === undefined
    )
      return

    setFieldValue(
      'services[0].access',
      values.services[0].algorithmPrivacy === true ? 'compute' : 'access'
    )
  }, [values, setFieldValue])

  return (
    <>
      <Field
        {...getFieldContent('dataTokenOptions', content.services.fields)}
        component={Input}
        name="services[0].dataTokenOptions"
      />
      {values.metadata.type === 'algorithm' ? (
        <Field
          {...getFieldContent('algorithmPrivacy', content.services.fields)}
          component={Input}
          name="services[0].algorithmPrivacy"
        />
      ) : values.metadata.type === 'datastream' ? (
        ' '
      ) : (
        <>
          <Field
            {...getFieldContent('access', content.services.fields)}
            component={Input}
            name="services[0].access"
            options={accessTypeOptions}
          />
          {values.services[0].access === 'compute' && (
            <Alert
              className={styles.fieldWarning}
              state="info"
              text={siteContent.warning.ctd}
            />
          )}
          {values.services[0].access === 'stream' && (
            <Alert
              className={styles.fieldWarning}
              state="info"
              text={siteContent.warning.stream}
            />
          )}
        </>
      )}
      <Field
        {...getFieldContent('providerUrl', content.services.fields)}
        component={Input}
        name="services[0].providerUrl"
      />
      <Field
        {...getFieldContent('files', content.services.fields)}
        component={Input}
        name="services[0].files"
        label={endPointLabel}
        help={endpointHelp}
        placeholder={docsPlaceholder}
      />
      {values.metadata.type === 'datastream' && (
        <Field
          {...getFieldContent('links', content.services.fields)}
          component={Input}
          name="services[0].links"
          label="Sample Files"
        />
      )}
      <Field
        {...getFieldContent('links', content.services.fields)}
        component={Input}
        name="services[0].links"
        label={docsLabel}
        help={docsHelp}
        placeholder={docsPlaceholder}
      />
      <Field
        {...getFieldContent('timeout', content.services.fields)}
        component={Input}
        name="services[0].timeout"
      />
    </>
  )
}
