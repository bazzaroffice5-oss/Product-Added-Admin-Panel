# Office Bazzar - Product Added Admin Panel

Dedicated standalone administrative application for managing the Office Bazzar B2B product catalogue, categorization, brands, and public store publications.

## Key Features

1. **Strict 2-Email Security Allowlist**:
   - Authorized accounts:
     - sales4@officebazzar.com
     - marketing@officebazzar.com
   - Enforced server-side with HMAC-SHA256 cryptographically signed session cookies (ob_admin_session).
2. **Product Catalog Management**:
   - Live product search, filter, creation, editing, and deletion.
   - 1-click publish / unpublish toggle.
   - Published products appear immediately on the public Office Bazzar storefront.
   - Draft products remain private.
3. **Image Uploads**:
   - Direct integration with Supabase Storage bucket products.
   - Generates public URLs for display on product cards and detail pages.
4. **Category & Brand Management**:
   - Modal-based creation of new categories and brands.
5. **Modern Corporate UI**:
   - Professional Office Bazzar business UI: light neutral canvas, white cards, dark navy headings, and orange accents.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React
- Supabase PostgreSQL & Supabase Storage

## Development Setup

1. Install dependencies:
   \\\ash
   npm install
   \\\

2. Configure environment variables in \.env.local\:
   \\\env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ADMIN_ALLOWED_EMAILS=sales4@officebazzar.com,marketing@officebazzar.com
   ADMIN_SECRET_KEY=<your-secret-key>
   \\\

3. Run the development server:
   \\\ash
   npm run dev
   \\\

4. Run the automated test suite:
   \\\ash
   node scripts/test_admin.js
   \\\
