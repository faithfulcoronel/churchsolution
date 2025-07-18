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

6. The sidebar menu items are loaded from the database when
   `VITE_ENABLE_DYNAMIC_MENU` is set to `true` (the default). Set it to
   `false` in your `.env` file to use the static menu defined in the source
   code.
   Menu items are grouped by a `section` column that mirrors the
   configuration in `src/config/navigation.ts`.
7. To enable ChatGPT suggestions in support threads, set
   `VITE_OPENAI_API_KEY` in your `.env` file with your OpenAI API key.

## Running tests

This project uses [Vitest](https://vitest.dev) for unit testing. After installing
dependencies run:

```bash
npm install && npm run test
```

## Generating PDF reports

A simple Node script is included for producing PDF versions of financial reports
using [PDFKit](https://pdfkit.org/).

Create a data file in JSON format and run:

```bash
npm run generate-report -- <data.json> <output.pdf>
```

The JSON file should contain a `title` and a `transactions` array with `date`,
`description` and `amount` fields. The generated PDF will list each transaction
and show the total amount at the bottom.

The `FinancialReportsPage` component now generates the PDF directly in the
browser using [pdf-lib](https://pdf-lib.js.org/) when you click the **PDF** button.

The new **Expense Summary** report lists expenses with their fund balances and
can also be exported to PDF.

## Tenant Scoped RBAC

StewardTrack now supports custom roles and permissions per tenant. The database schema includes tenant scoped `roles`, `user_roles`, `menu_permissions`, `role_menu_items` and `license_features` tables protected by RLS.
A helper function `can_user(permission text)` allows the frontend to quickly verify access.

## Changelog

- Dates are now stored and parsed using local `yyyy-MM-dd` format instead of ISO strings.
- Super admins can now query data across all tenants.
