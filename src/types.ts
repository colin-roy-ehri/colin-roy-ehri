export interface TabbedDashProps {
  route: string
  routeState?: any
}

export interface ConfigurationData {
  dashboards: Dashboard[]
  theme: string
  configRoles: string[]
}

export interface Dashboard {
  id: number | string
  title: string
  next: boolean
}
