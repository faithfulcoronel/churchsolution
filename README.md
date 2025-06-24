# churchsolution

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/faithfulcoronel/churchsolution)

## Features

### Members

- When a member is created an account is automatically generated.
- Member accounts use the format `MEM-<first 8 characters of member id>` for the account number.
- Financial transaction numbers use status-based prefixes such as `DFT` for drafts,
  `SUB` for submitted, `APP` for approved and `TRX` once posted.

## Local development

1. Copy `.env.example` to `.env` and provide real values for the listed API keys.
   Supabase and Stripe credentials are required and optional keys referenced in
   `supabase/config.toml` can also be configured here.
2. Start the Supabase stack locally using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase start
```

3. Run database migrations (and seeds) with:

```bash
supabase db reset
```

   Use `supabase db push` if you only want to apply migrations without resetting
   the database.

4. Define the `app.settings` values used by database functions. Either set them
   at the database level:

   ```sql
   ALTER DATABASE postgres SET app.settings.base_url = '<your site URL>';
   ALTER DATABASE postgres SET app.settings.email_service_url = '<email service URL>';
   ALTER DATABASE postgres SET app.settings.service_role_key = '<service role key>';
   ```

   Or export the equivalent environment variables before starting PostgREST:

   ```bash
   export PGRST_APP_SETTINGS_BASE_URL=<your site URL>
   export PGRST_APP_SETTINGS_EMAIL_SERVICE_URL=<email service URL>
   export PGRST_APP_SETTINGS_SERVICE_ROLE_KEY=<service role key>
   ```

5. Configure the Resend email provider used by the edge function by setting
   the following environment variables in your `.env` file:

   ```bash
   RESEND_API_KEY=<your Resend API key>
   RESEND_FROM_EMAIL=<default from address>
   ```

## Running tests

This project uses [Vitest](https://vitest.dev) for unit testing. After installing
dependencies run:

```bash
npm install && npm run test
```

