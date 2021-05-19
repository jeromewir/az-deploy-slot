import { Core } from "../run";
import { Command } from "./command";

interface GetParamsResult {
  slotName: string;
  configCloneSlotName: string;
  subscriptionID: string;
  ressourceGroup: string;
  appName: string;
  appLocation: string;
  clientID: string;
  applicationSecret: string;
  tenantID: string;
  appSettings?: { [key: string]: string };
}

export class GetParams extends Command<GetParamsResult> {
  private core: Core;

  constructor({ core }: { core: Core }) {
    super();

    this.core = core;
  }

  protected async execute(): Promise<GetParamsResult> {
    const core = this.core;

    const slotName = core.getInput("slotName", { required: true });
    const configCloneSlotName = core.getInput("configCloneSlotName");
    const subscriptionID = core.getInput("subscriptionID", { required: true });
    const ressourceGroup = core.getInput("ressourceGroup", { required: true });
    const appName = core.getInput("appName", { required: true });
    const appLocation = core.getInput("appLocation", { required: true });
    const clientID = core.getInput("clientID", { required: true });
    const applicationSecret = core.getInput("applicationSecret", {
      required: true,
    });
    const tenantID = core.getInput("tenantID", { required: true });
    const rawAppSettings = core.getInput("appSettings");
    let appSettings: { [key: string]: string };

    try {
      appSettings = JSON.parse(rawAppSettings);
    } catch (err) {
      throw new Error(`Invalid \`appSettings\` parameter: can't parse JSON`);
    }

    return {
      slotName,
      configCloneSlotName,
      subscriptionID,
      ressourceGroup,
      applicationSecret,
      appLocation,
      appName,
      clientID,
      tenantID,
      appSettings,
    };
  }
}
