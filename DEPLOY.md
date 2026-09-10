# Deploy to Azure App Service

> **Warning:** IWA Pharmacy Direct is intentionally vulnerable. Deploy it only to an isolated training or demonstration environment. Do not expose it to the public internet or use it for production workloads.

This guide deploys the application as a Linux custom container on Azure App Service. The GitHub Actions workflow builds an image, pushes it to GitHub Container Registry (GHCR), and configures the Web App to use the image tagged with the commit SHA.

## Prerequisites

- An Azure subscription with permission to create an App Service plan, Web App, and Microsoft Entra service principal.
- A GitHub repository or fork with GitHub Actions enabled.
- Azure CLI authenticated to the target subscription, or access to Azure Cloud Shell.

## GitHub Container Image Name

The deployment workflow derives the image name from the repository that runs it. Its value is `ghcr.io/<repository-owner>/<repository-name>`, converted to lowercase.

For example:

| Repository                    | Image                                 |
| ----------------------------- | ------------------------------------- |
| `fortify-presales/IWA-NodeJS` | `ghcr.io/fortify-presales/iwa-nodejs` |
| `example-org/IWA-NodeJS`      | `ghcr.io/example-org/iwa-nodejs`      |
| `alex/iwa-demo`               | `ghcr.io/alex/iwa-demo`               |

If you deploy from a fork, configure the Azure Web App to pull the image created under the fork owner's namespace. Ensure the fork owner or organization allows GitHub Actions to create packages and that the resulting GHCR package is public. The workflow already grants its `GITHUB_TOKEN` the `packages: write` permission needed to publish the image.

## Create the Web App

Create a **Linux Web App for Containers** in Azure App Service. The App Service plan and Web App must both be in the same resource group.

In the Azure portal:

1. Create an App Service plan using Linux.
2. Create a Web App using the **Container** publishing model on that plan.
3. In the Web App's **Environment variables** settings, add `WEBSITES_PORT` with the value `8080`.
4. In **Deployment Center** or **Container settings**, configure a public image temporarily, such as `ghcr.io/<repository-owner>/<repository-name>:latest`. Use the image name from [GitHub Container Image Name](#github-container-image-name). The GitHub Actions workflow replaces it with an immutable commit tag on its first run.

The application listens on port `8080`. Azure App Service must have `WEBSITES_PORT=8080` so its reverse proxy can reach the container.

## Create GitHub Deployment Credentials

The workflow uses Azure Resource Manager authentication instead of an App Service publish profile. In Azure Cloud Shell or a local terminal, create a service principal with access only to the Web App.

```bash
az ad sp create-for-rbac \
  --name "iwa-nodejs-github-deploy" \
  --role Contributor \
  --scopes "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Web/sites/<web-app-name>" \
  --sdk-auth
```

Replace the placeholders with the target Azure values. The command prints a JSON document containing a client secret. Copy the complete JSON output immediately and do not commit or otherwise share it.

## Configure Repository Secrets

In GitHub, open **Settings** > **Secrets and variables** > **Actions**, then add these repository secrets:

| Secret                 | Value                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| `AZURE_CREDENTIALS`    | Complete JSON output from `az ad sp create-for-rbac --sdk-auth`. |
| `AZURE_RESOURCE_GROUP` | Azure resource group that contains the Web App.                  |
| `AZURE_WEBAPP_NAME`    | Name of the Linux container Web App.                             |

The GHCR package produced by your repository must be public. For a private image, configure registry credentials on the Web App before deploying.

## Deploy

Push a commit to `main`, or run **Deploy to Azure Web App** manually from the repository's **Actions** tab. The workflow in [`.github/workflows/deploy-azure.yml`](.github/workflows/deploy-azure.yml) performs these steps:

1. Builds the Docker image from the repository `Dockerfile`.
2. Pushes `latest` and the immutable Git commit SHA tag to GHCR.
3. Authenticates to Azure with `AZURE_CREDENTIALS`.
4. Updates the Web App's container configuration to the SHA-tagged image.

Azure restarts the Web App after its container configuration changes. Open the Web App's default domain in the Azure portal after the new container starts.

## Troubleshooting

| Symptom                                           | Check                                                                                                                                                           |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The workflow cannot authenticate to Azure.        | Recreate `AZURE_CREDENTIALS`, verify the service principal has the Contributor role on the Web App, and confirm the secret contains the complete JSON document. |
| Azure cannot pull the image.                      | Confirm the image and SHA tag exist in GHCR. For a private package, configure registry credentials on the Web App.                                              |
| The container starts but the site is unavailable. | Verify the Web App has `WEBSITES_PORT=8080`, then inspect **Log stream** or container logs in Azure.                                                            |
| The old image is still running.                   | Confirm the workflow completed its `Update Azure Web App container image` step and wait for the App Service restart and image pull to finish.                   |
