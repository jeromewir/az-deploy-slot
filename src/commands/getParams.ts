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
}

export class GetParams extends Command<GetParamsResult> {
  private core: Core;

  constructor({ core }: { core: Core }) {
    super();

    this.core = core;
  }

  protected async execute(): Promise<GetParamsResult> {
    const core = this.core;

    const slotName = core.getInput("slotName");
    const configCloneSlotName = core.getInput("configCloneSlotName");
    const subscriptionID = core.getInput("subscriptionID");
    const ressourceGroup = core.getInput("ressourceGroup");
    const appName = core.getInput("appName");
    const appLocation = core.getInput("appLocation");
    const clientID = core.getInput("clientID");
    const applicationSecret = core.getInput("applicationSecret");
    const tenantID = core.getInput("tenantID");

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
    };
  }
}
