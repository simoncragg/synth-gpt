# 🛠️ Installation & Setup

Welcome to the installation and setup guide for the synth-gpt project! This document will walk you through all the steps required to get the synth-gpt API and React web application running locally for development and testing purposes.

## Contents

- [Cloud Account Setup](#cloud-account-setup)
- [Auth0 Setup](#auth0-setup)
- [Software Prerequisites](#software-prerequisites)
- [Clone the repository](#clone-the-repository)
- [API Setup](#api-setup)
- [App Setup](#app-setup)
- [Troubleshooting](#troubleshooting)

## Cloud Account Setup

First, you'll need an account with the following four providers:

- [OpenAI](https://openai.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)
- [Auth0](https://auth0.com/)

💡 Tip: These providers offer free tiers, so you can get started at no cost.

## Auth0 Setup

This section will guide you through using the Auth0 dashboard to create a Development Tenant, an Application, an API, and a User.

### Create a Development Tenant

1. Sign in to your Auth0 account.

2. Locate and select the 'Create Tenant' option.

3. Enter a tenant name of your liking. Note: This will be used as the subdomain for your Auth0 domain name. Once chosen, a tenant name cannot be renamed.

4. Select your Region.

5. Under 'Environment Tag', select 'Development'.

6. Click the 'Create' button.

### Create an Application

1. Sign in to your Auth0 account, making sure you are within your newly created 'Development' tenant.

2. Under 'Applications', select 'Create Application' and complete the Quick Start setup wizard. The name of the application is not important, however, the application type must be 'Single Page Application' and the technology type must be 'React'.

3. Once the application has been created, head over to your application's 'Settings' tab. Scroll down to the 'Application URIs' section and populate the following fields, as specified below:

   Application Login URI

   ```
   http://localhost:3000/login
   ```

   Allowed Callback URLs

   ```
   http://localhost:3000/callback

   ```

   Allowed Logout URLs

   ```
   http://localhost:3000/logout

   ```

4. Save the changes.

### Create an API

1. Sign in to your Auth0 account, making sure you are within your newly created 'Development' tenant.

2. Under 'APIs', select 'Create API' and complete the form. The name of the API is not important, however, the 'Identifier' field must be populated as specified below:

   Identifier

   ```
   http://localhost:3001/dev/api/v1/
   ```

   💡 Note: This value will be used as the audience parameter on authorization calls.

3. Click the 'Create' button.

### Create a User

1. Sign in to your Auth0 account, making sure you are within your newly created 'Development' tenant.

2. Navigate to 'User Management' -> 'Users'.

3. Click on the 'Create User' button and enter a valid email address and password. Ensure the 'Connection' is configured to 'Username-Password-Authentication'.

4. Click the 'Create' button.

Your Auth0 development tenant should now be correctly configured and ready for use!

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

This section outlines the process for configuring and initiating a backend system that not only manages APIs but also various integrated services such as OpenAI, AWS, Microsoft Azure, and Auth0, and handles the necessary environment variables and dependencies.

1.  First, navigate to the 'api' directory in the cloned repository.

    ```bash
    cd api
    ```

2.  Find the file named '.env.template' in the 'api' folder. This file may be hidden by default in some operating systems due to the dot prefix. To reveal hidden files, follow the instructions for your specific operating system: [Windows](https://support.microsoft.com/en-us/windows/view-hidden-files-and-folders-in-windows-97fbc472-c603-9d90-91d0-1166d1d9f4b5), [macOS](https://www.pcmag.com/how-to/how-to-access-your-macs-hidden-files).

3.  Make a copy of the '.env.template' file to a file named '.api.dev.env'. Be sure to create this copy outside of your repository folder, so you don't accidentally commit your API keys to the public repo.

    For example:

    ```bash
    cp .env.template ~/envs/synth-gpt/.api.dev.env
    ```

4.  Open your '.api.dev.env' file in a text editor.

5.  Create an API key for your local Chat API. This is a manually crafted string, not autogenerated, and should consist of 30-128 alphanumeric characters. Once you've created this key, add it to your '.api.dev.env' file like so:

    ```
    export CHAT_API_KEY=ExampleAPIKey1234abcdeFGHIJKLMnopq
    ```

6.  Sign in to your OpenAI account and generate an API key [here](https://platform.openai.com/account/api-keys). Add the generated key to your '.api.dev.env file.`

    ```
    export OPENAI_API_KEY=Your_OpenAI_API_Key
    ```

7.  Sign in to your AWS console and navigate to IAM. Create a new IAM user and attach the following inline policy:

    ```json
    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Effect": "Allow",
    			"Action": "polly:SynthesizeSpeech",
    			"Resource": "*"
    		}
    	]
    }
    ```

    The name of the IAM user is not important, so you can choose any name you like. This user will be used to generate speech with Amazon Polly.

8.  After creating the IAM user, proceed to generate an access key for this user. This action will produce an access key ID and a secret access key. Input these values into your '.api.dev.env' file.

    ```
    export POLLY_ACCESS_KEY_ID=Your_Amazon_Polly_ACCESS_KEY_ID
    export POLLY_SECRET_ACCESS_KEY=Your_Amazon_Polly_SECRET_ACCESS_KEY
    ```

9.  Sign in to your Microsoft Azure portal and navigate to the Bing Search v7 resource. You can follow the instructions here to create a Bing Search resource if you don't already have one.
    Once you have a Bing Search resource, copy one of the generated API keys and add it to your '.api.dev.env' file.

    ```
    export BING_SEARCH_API_KEY=Your_Bing_Search_API_Key
    ```

10. Sign in to your Auth0 account and navigate to your Application. On your Application's 'Settings' tab, locate your 'Domain' and copy it into your '.api.dev.env' file, as shown below:

    ```
    export JWT_ISSUER_DOMAIN=Your_Auth0_Domain
    ```

11. Back in your Auth0 dashboard, navigate to User Management -> Users, and select your newly created user. Scroll down to the 'Identity Provider Attributes' section and copy your 'user_id'. Remove the leading 'auth0|' and copy the remainder of the user_id into your '.api.dev.env' file.

    ```
    export TEST_USER_ID=Your_shortened_user_id
    ```

    This User Id will now be used to seed the 'chat' dynamodb table in development.

12. Save and close the '.api.dev.env' file.

13. Open a bash shell and navigate back to the 'api' folder within the project, then source your env file to set the environment variables

    ```bash
    source ~/envs/synth-gpt/.api.dev.env
    ```

14. Install the npm dependencies

    ```bash
    npm i
    ```

    If there are overrides in the npm dependencies that need to be updated, you may also need to run the npm update command as follows:

    ```bash
    npm update
    ```

15. Finally, run the backend API services

    ```bash
    npm start
    ```

    This command will start the following services:

    - dynamodb-local (port 8000)
    - Rest API endpoints (port 3001)
    - WebSocket endpoints (port 4001)
    - S3-local (port 4569)

## App Setup

1. Navigate to the project's 'app' folder.

2. Find the file named '.env.template' in the 'app' folder. This file may be hidden by default in some operating systems due to the dot prefix. To reveal hidden files, follow the instructions for your specific operating system: [Windows](https://support.microsoft.com/en-us/windows/view-hidden-files-and-folders-in-windows-97fbc472-c603-9d90-91d0-1166d1d9f4b5), [macOS](https://www.pcmag.com/how-to/how-to-access-your-macs-hidden-files).

3. Make a copy of the '.env.template' file to a file named '.app.dev.env'. Be sure to create this copy outside of your repository folder, so you don't accidentally commit your API keys to the public repo.

   For example:

   ```bash
   cp .env.template ~/envs/synth-gpt/.app.dev.env
   ```

4. Open your '.app.dev.env' file in a text editor.

5. Remember the unique API key you invented in Step 5 of the [API Setup](#api-setup)? It's time to use that key again. Copy this exact key into your '.app.dev.env' file, as illustrated below:

   ```
   export REACT_APP_CHAT_API_KEY=ExampleAPIKey1234abcdeFGHIJKLMnopq
   ```

   Please note that the environment variable name here differs from the one in your 'api.dev.env' file. Make sure to copy carefully to avoid any errors, and remember, you should replace 'ExampleAPIKey1234abcdeFGHIJKLMnopq' with your actual API key.

6. Sign in to your Auth0 account and navigate to your Application. On your Application's 'Settings' tab, locate your 'Domain' and 'Client ID' values. Copy these values and insert them into your '.app.dev.env' file, as shown below:

   ```
   export REACT_APP_AUTH0_DOMAIN=Your_Auth0_Domain
   export REACT_APP_AUTH0_CLIENT_ID=Your_Auth0_Client_ID
   ```

   Please replace 'Your_Auth0_Domain' and 'Your_Auth0_Client_ID' with the actual values from your Auth0 application settings.

7. Open a bash shell and navigate back to the 'app' folder within the project, then source your env file to set the environment variables

   ```bash
   source ~/envs/synth-gpt/.app.dev.env
   ```

8. Install the npm dependencies

   ```bash
   npm i
   ```

   If there are overrides in the npm dependencies that need to be updated, you may also need to run the npm update command as follows:

   ```bash
   npm update
   ```

9. Finally, run the react app

   ```bash
   npm start
   ```

If everything was set up correctly, the synth-gpt app should now be accessible at [http://localhost:3000/](http://localhost:3000/).

## Troubleshooting

- If you are not prompted to log in, try navigating directly to [http://localhost:3000/login](http://localhost:3000/login) and click the 'Login' button.

- Ensure the backend services are running successfully by checking your 'api' bash terminal for any error output.

- Double check that the environment variables are properly set in both the 'app' and 'api' bash terminals.

  💡 Tip: You can check an environment variable is set using the echo command:

  ```bash
  echo $REACT_APP_AUTH0_DOMAIN
  ```

  Note the presence of the $ symbol.
