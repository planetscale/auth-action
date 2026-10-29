import * as core from "@actions/core";

import * as utils from "./utils";

interface ServiceToken {
  id: string;
  token: string;
}

async function run(): Promise<void> {
  try {
    const organization = core.getInput("organization", { required: true });
    const oidcTrust = core.getInput("oidc-trust", { required: true });

    // `getIDToken` masks the token in logs
    const idToken = await core.getIDToken(`planetscale:${oidcTrust}`);
    utils.logInfo("Created GitHub Actions OIDC token");

    const url = `https://api.planetscale.com/v1/organizations/${encodeURIComponent(organization)}/oidc-trusts/${encodeURIComponent(oidcTrust)}/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ token: idToken })
    });
    if (!response.ok) {
      throw new Error(`Failed to exchange OIDC token: ${response.status} ${await response.text()}`);
    }

    const serviceToken = (await response.json()) as ServiceToken;
    core.setSecret(serviceToken.token);
    utils.logInfo(`Created PlanetScale service token ${serviceToken.id}`);

    core.setOutput("service-token-id", serviceToken.id);
    core.setOutput("service-token", serviceToken.token);
  } catch (error) {
    core.setFailed(`❌ Action failed with error: ${error}`);
  }
}

run();
