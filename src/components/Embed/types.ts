import { Dashboard, ConfigurationData } from "../../types";

export interface EmbedProps {
  dashboards: Dashboard[],
  configurationData: ConfigurationData
  updateConfigurationData(
    configurationData: ConfigurationData
  ): Promise<boolean>
  isAdmin: boolean
}
