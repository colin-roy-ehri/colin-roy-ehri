import {
  Box,
  Button,
  Divider,
  FieldCheckbox,
  FieldText,
  Form,
  Heading,
  IconButton,
  Space,
  theme,
  ValidationMessages,
} from '@looker/components'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { ConfigurationData, Dashboard } from '../../types'
import { ConfigureProps } from './types'
import {
  Looker40SDK,
  NodeSession,
  NodeSettingsIniFile,
  NodeSettings,
  ISDKSuccessResponse,
} from '@looker/sdk/lib/node'
import { isInteger } from 'lodash'
import { resolve6 } from 'dns'

const SaveDashboardButton = styled(Button as any)`
border-color: ${(props) => props.theme.colors.positive};
background-color: ${(props) => props.theme.colors.positive};
`


export const Configure: React.FC<ConfigureProps> = ({
  configurationData,
  updateConfigurationData,
}) => {
  const [localConfigurationData, setLocalConfigurationData] = useState<
    ConfigurationData
  >({
    theme: '',
    dashboards: [
      { id: '', title: '', next: false } as Dashboard,
    ],
    configRoles: [] 
  } as ConfigurationData)
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK } = extensionContext
  const sdk = extensionContext.core40SDK

  useEffect(() => {
    const initialize = async () => {
      {
        try {
          const contextData = await extensionSDK.refreshContextData()
          if (contextData) {
            setLocalConfigurationData({
              ...localConfigurationData,
              ...(contextData as ConfigurationData),
            })
          }
        } catch (error) {
          console.error('failed to get latest context data', error)
        }
      }
    }
    setLocalConfigurationData({
      ...localConfigurationData,
      ...configurationData,
    })
    initialize()
  }, [])

  const validateValue = (value: string): number | string => {
    if (value.match(/\d+/g)) {
      return parseInt(value, 10)
    } else {
      return value
    }
  }

  const addDashboard = () => {
    setLocalConfigurationData({
      theme: localConfigurationData.theme,
      dashboards: [
        ...localConfigurationData.dashboards,
        { id: '', title: '' } as Dashboard,
      ],
      configRoles: localConfigurationData.configRoles,
    })
  }

  const addConfigRole = () => {
    setLocalConfigurationData({
      theme: localConfigurationData.theme,
      dashboards: localConfigurationData.dashboards,
      configRoles: [ ...localConfigurationData.configRoles, '' ]
    })
  }

  const deleteDashboard = (index: number) => {
    const newConfiguration = { ...localConfigurationData }
    newConfiguration.dashboards.splice(index, 1)
    setLocalConfigurationData({ ...newConfiguration })
  }

  const changeConfigRole = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    localConfigurationData.configRoles[index] = event.currentTarget.value
    setLocalConfigurationData({ ...localConfigurationData })
  }

  const deleteRole = (index: number) => {
    const newConfiguration = { ...localConfigurationData }
    newConfiguration.configRoles.splice(index, 1)
    setLocalConfigurationData({ ...newConfiguration })
  }

  const changeDashboardId = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    localConfigurationData.dashboards[index]['id'] = event.currentTarget.value
    setLocalConfigurationData({ ...localConfigurationData })
  }

  const changeDashboardTitle = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    localConfigurationData.dashboards[index]['title'] =
      event.currentTarget.value
    setLocalConfigurationData({ ...localConfigurationData })
  }

  const changeDashboardNext = (index: number) => {
    localConfigurationData.dashboards[index]['next'] = !localConfigurationData
      .dashboards[index]['next']
    setLocalConfigurationData({ ...localConfigurationData })
  }

  const getValidationMessages = (): ValidationMessages[] | undefined => {
    let validationMessages: ValidationMessages[] | undefined = undefined
    localConfigurationData.dashboards.map(({ id }, index) => {
      if (!isInteger(id)) {
        if (!validationMessages) {
          validationMessages = []
        } else if (validationMessages[index]) {
          validationMessages[index]['id'] = {
            type: 'error',
            message: 'dashboard id is not numeric',
          }
        }
      }
    })
    return validationMessages
  }

  const onConfigChangeSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    updateConfigurationData({ ...localConfigurationData })
  }

  const onConfigResetClick = () => {
    setLocalConfigurationData({ ...configurationData })
  }

  const changeTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    localConfigurationData.theme = event.currentTarget.value
    setLocalConfigurationData({ ...localConfigurationData })
  }

  const validationMessages = getValidationMessages()

  return (
    <div>
      <Heading mt="xlarge">Dashboards Configuration</Heading>

      <Box m="large">
        <Form
          // validationMessages={validationMessages}
          onSubmit={onConfigChangeSubmit}
        >
          <Divider mt="medium" appearance="onDark" />
          <Heading as="h3">Dashboard Theme</Heading>

          <FieldText
            value={localConfigurationData.theme}
            onChange={changeTheme}
          />

          <Divider mt="medium" appearance="onDark" />
          <Heading as="h3">Extension Config Roles</Heading>

          {localConfigurationData.configRoles.map((role, index) => {
            return (
              <div key={`role${index+1}`}>
                <Space>
                <FieldText
                  value={role}
                  onChange={(e) =>
                    changeConfigRole(
                      e as React.ChangeEvent<HTMLInputElement>,
                      index
                    )
                  }
                />
                <IconButton
                      icon="Trash"
                      label="Delete Dashboard"
                      size="small"
                      color="critical"
                      onClick={() => deleteRole(index)}
                    />
                    </Space>
              </div>
            )
          })}

          <Space>
            <Button iconBefore="CircleAdd" onClick={() => addConfigRole()}>
              Add Role
            </Button>
          </Space>

          <Divider mt="medium" appearance="onDark" />

          <Heading as="h3">Configure Dashboard Tabs</Heading>

          {localConfigurationData.dashboards.map(
            ({ id, title, next }, index) => {
              return (
                <div key={`id + title + ${index+1}`}>
                  <Space>
                    <FieldText
                      label="Dashboard ID"
                      value={id}
                      onChange={(e) =>
                        changeDashboardId(
                          e as React.ChangeEvent<HTMLInputElement>,
                          index
                        )
                      }
                    />
                    <FieldText
                      label="Dashboard Title"
                      value={title}
                      onChange={(e) =>
                        changeDashboardTitle(
                          e as React.ChangeEvent<HTMLInputElement>,
                          index
                        )
                      }
                    />
                    <FieldCheckbox
                      label="Next"
                      checked={next}
                      onChange={() => changeDashboardNext(index)}
                    />
                    <IconButton
                      icon="Trash"
                      label="Delete Dashboard"
                      size="small"
                      color="critical"
                      onClick={() => deleteDashboard(index)}
                    />
                  </Space>
                </div>
              )
            }
          )}

          <Space>
            <Button iconBefore="CircleAdd" onClick={() => addDashboard()}>
              Add Dashboard
            </Button>
          </Space>

          <Divider mt="medium" appearance="onDark" />

          <Space>
            <SaveDashboardButton>Save dashboards</SaveDashboardButton>
          </Space>
        </Form>
      </Box>
    </div>
  )
}
