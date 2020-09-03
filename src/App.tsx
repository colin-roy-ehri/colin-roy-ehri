import React, { useState } from 'react'
import { TabbedDash } from './TabbedDash'
import { ExtensionProvider } from '@looker/extension-sdk-react'
import { hot } from 'react-hot-loader/root'

export const App: React.FC<{}> = hot(() => {
  const [route, setRoute] = useState('')
  const [routeState, setRouteState] = useState()

  const onRouteChange = (route: string, routeState?: any) => {
    setRoute(route)
    setRouteState(routeState)
  }

  return (
    <ExtensionProvider onRouteChange={onRouteChange}>
      <TabbedDash route={route} routeState={routeState} />
    </ExtensionProvider>
  )
})
