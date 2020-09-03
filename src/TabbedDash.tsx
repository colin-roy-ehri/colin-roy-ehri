import React, { useEffect, useState, useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import * as semver from 'semver'
import { Box, ComponentsProvider, MessageBar } from '@looker/components'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import { EmbedDashboard } from './components/Embed'
import { Configure } from './components/Configure'
import { TabbedDashProps, ConfigurationData } from './types'
import { update } from 'lodash'
import { IRole } from '@looker/sdk/lib/node'

export enum ROUTES {
  EMBED_DASHBOARD = '/',
  CONFIG_ROUTE = '/config',
}

export const TabbedDash: React.FC<TabbedDashProps> = ({
  route,
  routeState,
}) => {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK, initializeError } = extensionContext
  const sdk = extensionContext.core40SDK
  const [canPersistContextData, setCanPersistContextData] = useState<boolean>(
    false
  )
  const [configurationData, setConfigurationData] = useState<
    ConfigurationData
  >()
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false)

  useEffect(() => {
    const initialize = async () => {
      // Context requires Looker version 7.14.0. If not supported provide
      // default configuration object and disable saving of context data.
      let context
      if (
        semver.intersects(
          '>=7.14.0',
          extensionSDK.lookerHostData?.lookerVersion || '7.0.0',
          true
        )
      ) {
        try {
          context = await extensionSDK.getContextData()
          setCanPersistContextData(true)
        } catch (error) {
          console.error(error)
        }
      }
      setConfigurationData(
        context || {
          theme: 'Looker',
          dashboards: [
          ],
          configRoles: [
          ],
        }
      )
    }

    const checkAdmin = async () => {
      try {
        const contextData = await extensionSDK.refreshContextData()
        const roles = await sdk
          .ok(sdk.all_roles({ fields: 'name' }))
          .then((value) =>
            value.map((role) => {
              return role.name
            })
          )
        console.log('roles', roles)
        const isAdmin =
          roles.includes('Admin') ||
          (contextData.configRoles &&
            roles.some((role) => contextData.configRoles.includes(role)))
        setIsAdmin(isAdmin)
      } catch (error) {
        console.error(error)
      }
    }

    initialize()
    checkAdmin()
  }, [])

  const updateConfigurationData = async (
    configurationData: ConfigurationData
  ): Promise<boolean> => {
    setConfigurationData(configurationData)
    {
      try {
        await extensionSDK.saveContextData(configurationData)
        return true
      } catch (error) {
        console.log(error)
      }
    }
    return false
  }

  return (
    <>
      {configurationData && (
        <ComponentsProvider>
          {initializeError ? (
            <MessageBar intent="critical">{initializeError}</MessageBar>
          ) : (
              <Route path={ROUTES.EMBED_DASHBOARD}>
                <EmbedDashboard
                  dashboards={configurationData.dashboards}
                  configurationData={configurationData}
                  updateConfigurationData={updateConfigurationData}
                  isAdmin={isAdmin}
                />
              </Route>
          )}
        </ComponentsProvider>
      )}
    </>
  )
}

export const Layout = styled(Box as any)`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 200px auto;
  width: 100vw;
`
