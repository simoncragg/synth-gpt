# 🛠️ Installation & Setup

Welcome to the installation and setup guide for the synth-gpt project! This document will walk you through all the steps required to get the synth-gpt API and React web application running locally for development and testing purposes.

## Contents

- [Cloud Account Setup](#cloud-account-setup)
- [Auth0 Setup](#auth0-setup)
- [Software Prerequisites](#software-prerequisites)
- [Clone the repository](#clone-the-repository)
- [API Setup](#api-setup)
- [App Setup](#app-setup)
- [Code Interpreter Setup](#code-interpreter-setup)
- [Troubleshooting](#troubleshooting)

## Cloud Account Setup

First, you'll need an account with the following four providers:

- [OpenAI](https://openai.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)
- [Auth0](https://auth0.com/)

💡 Tip: These providers offer free tiers, so you can get started at no cost.

## Auth0 Setup

Follow the link below to find step-by-step instructions on setting up your Auth0 Development Tenant, Application, API, and User:

[Auth0 Setup Guide ⨠](setup-auth0.md)

## Software Prerequisites

1. Install Node.js v18.16.1

   You can install Node.js through several methods:

   - Download the installer from the [official Node.js website](https://nodejs.org/en/download/). Be sure to get the LTS version for long term support.
   - Use a version manager like [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) or [nvm-windows](https://github.com/coreybutler/nvm-windows) for Windows. This allows you to easily switch between Node versions.
   - Use [Volta](https://volta.sh/) to manage your Node.js versions and tools.
   - On Linux you can often install via your package manager, e.g. apt install nodejs on Ubuntu/Debian.

   Once installed, verify you are running Node v18.16.1 or later:

   ```bash
   node -v
   ```

2. Download and install [Docker Desktop](https://docs.docker.com/get-docker/).

3. Download the [amazon/dynamodb-local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) container from AWS.

## Clone the repository

1. Clone the repository to your local machine

   ```bash
   git clone https://github.com/simoncragg/synth-gpt.git
   ```

2. Navigate to the 'synth-gpt' project directory

   ```bash
   cd synth-gpt
   ```

## API Setup

Follow the link below to set up the React web app's front-end and run it on your local machine:

[API Setup Guide ⨠](./setup-api.md)

## App Setup

Follow the link below to set up the front-end React web app and run it on your local machine:

[App Setup Guide ⨠](./setup-app.md)

## Code Interpreter Setup

To run the code interpreter on your local machine, simply navigate to the 'interpreter' directory, then run the following commands:

```bash
./build.sh
./run.sh dev
``````

## Troubleshooting

- If you are not prompted to log in, try navigating directly to [http://localhost:3000/login](http://localhost:3000/login) and click the 'Login' button.

- Ensure the backend services are running successfully by checking your 'api' bash terminal for any error output.

- Double check that the environment variables are properly set in both the 'app' and 'api' bash terminals.

  💡 Tip: You can check an environment variable is set using the echo command:

  ```bash
  echo $VITE_AUTH0_DOMAIN
  ```

  Note the presence of the $ symbol.
