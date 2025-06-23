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

## Running tests

This project uses [Vitest](https://vitest.dev) for unit testing. After installing
dependencies run:

```bash
npm install && npm run test
```

