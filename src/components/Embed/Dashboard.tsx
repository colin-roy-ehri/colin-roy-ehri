import { LookerEmbedDashboard, LookerEmbedSDK } from '@looker/embed-sdk';
import { LookerDashboardOptions } from '@looker/embed-sdk/lib/types';
import React, { useCallback } from 'react';
import { EmbedContainer } from './components/EmbedContainer';


export const Dashboard: React.FC<any> = ({
  id,
  dashboard,
  theme,
  next,
  extensionContext,
  setDashboard,
}) => {

  const canceller = (event: any) => {
    return { cancel: !event.modal }
  }

  const setupDashboard = (dashboard: LookerEmbedDashboard) => {
    const elementOptions = { elements: { 'test': { title_hidden: true } } }
    // console.log('setting dashboard options', {elementOptions})
    dashboard.setOptions(elementOptions as LookerDashboardOptions)
    setDashboard(dashboard)
    dashboard.setOptions(elementOptions as LookerDashboardOptions)

  }

  const runDashboard = () => {
    if (dashboard) {
      dashboard.run()
    }
  }

  const embedCtrRef = useCallback(
    (el) => {
      const hostUrl = extensionContext?.extensionSDK?.lookerHostData?.hostUrl
      if (el && hostUrl) {
        el.innerHTML = ''
        LookerEmbedSDK.init(hostUrl)
        const db = LookerEmbedSDK.createDashboardWithId(id as string)
        db.withTheme(theme as string)
        if (next) {
          db.withNext('-next')
        }
        db.appendTo(el)
          .on('drillmenu:click', canceller)
          .on('drillmodal:explore', canceller)
          .on('dashboard:tile:explore', canceller)
          .on('dashboard:tile:view', canceller)
          .build()
          .connect()
          .then(setupDashboard)
          .catch((error: Error) => {
            console.error('Connection error', error)
          })
      }
    },
    [next]
  )

  return (
    <>
      <EmbedContainer ref={embedCtrRef} />
    </>
  )
}
