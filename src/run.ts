import { snakeCase } from "snake-case";
import * as core from "@actions/core";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { WebSiteManagementClient } from "@azure/arm-appservice";
import { GetParams } from "./commands/getParams";
import {
  WebAppsListApplicationSettingsResponse,
  WebAppsListApplicationSettingsSlotResponse,
} from "@azure/arm-appservice/esm/models";

export type Core = {
  getInput: (s: string, opts?: core.InputOptions) => string;
  setFailed: (err: Error) => void;
};

const authenticate = async ({
  clientID,
  applicationSecret,
  tenantID,
}: {
  clientID: string;
  applicationSecret: string;
  tenantID: string;
}) => {
  return msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
    clientID,
    applicationSecret,
    tenantID
  );
};

export async function run({
  injectedCore,
}: { injectedCore?: Core } = {}): Promise<void> {
  try {
    const getParams = new GetParams({ core: injectedCore || core });

    const {
      slotName: candidateSlotName,
      configCloneSlotName,
      subscriptionID,
      ressourceGroup,
      appName,
      appLocation,
      clientID,
      applicationSecret,
      tenantID,
      appSettings,
    } = await getParams.run();

    const { credentials } = await authenticate({
      clientID,
      applicationSecret,
      tenantID,
    });

    const slotName = snakeCase(candidateSlotName);

    const client = new WebSiteManagementClient(credentials, subscriptionID);

    await client.webApps.createOrUpdateSlot(
      ressourceGroup,
      appName,
      {
        location: appLocation,
        enabled: true,
      },
      slotName
    );

    let slotConfig:
      | WebAppsListApplicationSettingsResponse
      | WebAppsListApplicationSettingsSlotResponse
      | undefined;

    // Get config from slot
    if (configCloneSlotName) {
      slotConfig = await client.webApps.listApplicationSettingsSlot(
        ressourceGroup,
        appName,
        configCloneSlotName
      );
    } else if (appSettings) {
      // Get config from main slot only if we actually change the config
      slotConfig = await client.webApps.listApplicationSettings(
        ressourceGroup,
        appName
      );
    }

    // Apply the config only if we have something to change
    if (slotConfig) {
      slotConfig.properties = Object.assign(
        {},
        slotConfig.properties,
        appSettings
      );

      await client.webApps.updateApplicationSettingsSlot(
        ressourceGroup,
        appName,
        slotConfig,
        slotName
      );
    }

    const publishProfileResponse = await client.webApps.listPublishingProfileXmlWithSecretsSlot(
      ressourceGroup,
      appName,
      {},
      slotName
    );

    const publishProfile = publishProfileResponse.readableStreamBody?.read();

    if (!publishProfile) {
      throw new Error(`Cannot retrieve publish profile`);
    }

    core.setOutput("PUBLISH_PROFILE", publishProfile.toString());

    // const ms: string = core.getInput('milliseconds')
    // core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    (injectedCore || core).setFailed(error.message);
  }
}
