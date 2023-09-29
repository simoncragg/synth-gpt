[<< Installation & Setup](./setup-main.md)

## App Setup

This section walks you through setting up the front-end React web app and running it on your local machine.

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
   export VITE_CHAT_API_KEY=ExampleAPIKey1234abcdeFGHIJKLMnopq
   ```

   Please note that the environment variable name here differs from the one in your 'api.dev.env' file. Make sure to copy carefully to avoid any errors, and remember, you should replace 'ExampleAPIKey1234abcdeFGHIJKLMnopq' with your actual API key.

6. Sign in to your Auth0 account and navigate to your Application. On your Application's 'Settings' tab, locate your 'Domain' and 'Client ID' values. Copy these values and insert them into your '.app.dev.env' file, as shown below:

   ```
   export VITE_AUTH0_DOMAIN=Your_Auth0_Domain
   export VITE_AUTH0_CLIENT_ID=Your_Auth0_Client_ID
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
