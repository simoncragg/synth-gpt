[<< Installation & Setup](./setup-main.md)

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

Your Auth0 development tenant should now be correctly configured and ready for use.
