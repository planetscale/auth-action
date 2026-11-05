# planetscale/auth-action

Authenticate to the PlanetScale API from GitHub Actions and Depot CI with OpenID Connect (OIDC).

The action requests an OIDC token from the provider and exchanges it with the PlanetScale API for a short-lived service token, replacing the need for long-lived credentials in your CI secrets.

## Setup

An organization admin must first create a trust policy in the PlanetScale dashboard under [**Settings** > **OpenID Connect**](https://app.planetscale.com/~/settings/oidc). A policy defines the claims a workflow must present (such as a repository or branch), the accesses to grant, and the lifetime of the service token.

See the [PlanetScale OIDC documentation](https://planetscale.com/docs/api/oidc) for details.

## Usage

The job must have the `id-token: write` permission.

```yaml
name: CI

on:
  push:
    branches: [ main ]

jobs:
  main:
    runs-on: ubuntu-latest
    permissions:
      id-token: write

    steps:
    - uses: planetscale/auth-action@v1
      id: auth
      with:
        organization: "${{ vars.PLANETSCALE_ORGANIZATION }}"
        oidc-trust: ${{ vars.PLANETSCALE_OIDC_TRUST_ID }}

    - name: Read organization
      env:
        ORGANIZATION: ${{ vars.PLANETSCALE_ORGANIZATION }}
        SERVICE_TOKEN_ID: ${{ steps.auth.outputs.service-token-id }}
        SERVICE_TOKEN: ${{ steps.auth.outputs.service-token }}
      run: |
        curl --fail-with-body --silent --show-error \
          --header "Authorization: $SERVICE_TOKEN_ID:$SERVICE_TOKEN" \
          --header "Accept: application/json" \
          "https://api.planetscale.com/v1/organizations/$ORGANIZATION" \
          | jq '{name, created_at}'
```

## Inputs

| Name | Required | Description |
| --- | --- | --- |
| `organization` | Yes | The name of the PlanetScale organization that owns the OIDC trust. |
| `oidc-trust` | Yes | The ID of the PlanetScale OIDC trust to authenticate with. |

## Outputs

| Name | Description |
| --- | --- |
| `service-token-id` | The ID of the created PlanetScale service token. |
| `service-token` | The created PlanetScale service token. |
