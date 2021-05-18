import * as core from "@actions/core";
import * as msRestNodeAuth from "@azure/ms-rest-nodeauth";
import { WebSiteManagementClient } from "@azure/arm-appservice";
import { GetParams } from "./commands/getParams";

export type Core = {
  getInput: (s: string) => string;
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
      slotName,
      configCloneSlotName,
      subscriptionID,
      ressourceGroup,
      appName,
      appLocation,
      clientID,
      applicationSecret,
      tenantID,
    } = await getParams.run();

    const { credentials } = await authenticate({
      clientID,
      applicationSecret,
      tenantID,
    });

    const client = new WebSiteManagementClient(credentials, subscriptionID);

    await client.webApps.createOrUpdateSlot(
      ressourceGroup,
      appName,
      {
        location: appLocation,
        enabled: true,
        // cloningInfo: {
        //   sourceWebAppId: `/subscriptions/${subscriptionID}/resourceGroups/${ressourceGroup}/providers/Microsoft.Web/sites/${appName}/slots/${configCloneSlotName}`,
        // },
      },
      slotName
    );

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
