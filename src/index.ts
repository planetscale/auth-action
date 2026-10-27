import * as core from "@actions/core";

import * as utils from "./utils";

async function run(): Promise<void> {
  try {
    const oidcTrust = core.getInput("oidc-trust", { required: true });

    // `getIDToken` masks the token in logs
    await core.getIDToken(`planetscale:${oidcTrust}`);
    utils.logInfo("Created GitHub Actions OIDC token");
  } catch (error) {
    core.setFailed(`❌ Action failed with error: ${error}`);
  }
}

run();
