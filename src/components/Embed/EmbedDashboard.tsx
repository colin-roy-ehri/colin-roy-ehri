import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  DialogManager,
  DialogContent,
  Button,
  Flex,
  FlexItem,
  IconButton,
} from '@looker/components'
import { LookerEmbedDashboard } from '@looker/embed-sdk'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import React, { useCallback, useContext, useEffect } from 'react'
import styled, { css } from 'styled-components'

import { Dashboard } from './Dashboard'
import { EmbedProps } from './types'
import { Configure } from '../Configure/Configure'
import { ConfigurationData } from '../../types'

export const EmbedDashboard: React.FC<EmbedProps> = ({
  dashboards,
  configurationData,
  updateConfigurationData,
  isAdmin
}) => {
  const [dashboardNext, setDashboardNext] = React.useState(true)
  const [running, setRunning] = React.useState(true)
  const [dashboard, setDashboard] = React.useState<LookerEmbedDashboard>()
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const [selectedTab, setSelectedTab] = React.useState(0)
  const { extensionSDK } = extensionContext
  const sdk = extensionContext.core40SDK

  const StyledTabList = styled(TabList as any)`
    background-color: #f4f4f4;
    border-bottom: none;
    padding-left: 1em;
  `

  const configIconLocation = {
    position: 'absolute' as 'absolute',
    right: '1em',
    top: '2em',
    zIndex: 999,
  }

  const StyledTab = styled(Tab as any)`
    border-bottom-color: transparent;
    margin-top: 2em;
    margin-bottom: 0;
    padding-bottom: 1em;
    padding-left: 2em;
    padding-right: 2em;
    ${(props) =>
      props.hover &&
      props.selected &&
      css`
        border-bottom-color: transparent;
        background-color: white;
      `}
    ${(props) =>
      props.selected &&
      css`
        background-color: white;
        border-bottom-color: transparent;
        border-top: 5px solid;
        border-top-color: #6c43e0;
        border-right: 1px solid;
        border-right-color: #e1e1e1;
        border-left: 1px solid;
        border-left-color: #e1e1e1;
      `}
    ${(props) =>
      props.hover &&
      css`
        border-bottom-color: transparent;
      `}
  `

  const toggleDashboard = () => {
    setDashboardNext(!dashboardNext)
  }

  const canceller = (event: any) => {
    return { cancel: !event.modal }
  }

  const updateRunButton = (running: boolean) => {
    setRunning(running)
  }

  const setupDashboard = (dashboard: LookerEmbedDashboard) => {
    setDashboard(dashboard)
  }

  const handleSelectedTab = (index: number) => {
    setSelectedTab(index)
  }

  const isTabSelected = (index: number) => {
    return selectedTab == index ? true : false
  }

  return (
    <>
      <div key={selectedTab}>
        <Tabs
          defaultIndex={selectedTab}
          onChange={(index) => handleSelectedTab(index)}
        >
            <StyledTabList
              selectedIndex={selectedTab}
              onSelectTab={(index: any) => handleSelectedTab(index)}
            >
              {dashboards.map(({ title }, index) => {
                return <StyledTab key={index}>{title}</StyledTab>
              })}
            </StyledTabList>
          <TabPanels>
            {dashboards.map(({ next }, index) => {
              return (
                <TabPanel key={index}>
                  <Dashboard
                    id={dashboards[selectedTab]['id']}
                    running={running}
                    theme={configurationData.theme}
                    next={next}
                    extensionContext={extensionContext}
                    setDashboard={setupDashboard}
                  />
                </TabPanel>
              )
            })}
          </TabPanels>
        </Tabs>
      </div>
      {isAdmin ? (
        <div style={configIconLocation}>
          <DialogManager
            content={
              <DialogContent>
                <Configure
                  configurationData={configurationData}
                  updateConfigurationData={updateConfigurationData}
                />
              </DialogContent>
            }
          >
            <IconButton
              icon="GearOutline"
              label="Configure Dashboards"
              size="medium"
            />
          </DialogManager>
        </div>
      ) : (
        ''
      )}
      )
    </>
  )
}
