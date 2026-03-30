import postgres from 'postgres';
import 'dotenv/config';

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

let databaseUrl = rawDatabaseUrl;

try {
  const parsed = new URL(rawDatabaseUrl);
  const isSupabasePooler = parsed.hostname.endsWith('.pooler.supabase.com');

  // In this workspace, 6543 repeatedly times out while 5432 responds reliably.
  if (isSupabasePooler && parsed.port === '6543') {
    parsed.port = '5432';
    databaseUrl = parsed.toString();
  }
} catch {
  // Keep the original value if DATABASE_URL is not URL-parsable.
}

const sql = postgres(databaseUrl, {
  // Supabase pooler requires SSL in all environments
  ssl: { rejectUnauthorized: false },
  // Serverless: keep pool small
  max: 1,
  // Required for Supabase connection pooler (PgBouncer) — no prepared statements
  prepare: false,
  // Skip pg_catalog type introspection query — killed by Supabase statement timeout
  fetch_types: false,
  // Generous timeouts for cold starts
  connect_timeout: 30,
  idle_timeout: 20,
  // Don't keep connection alive between serverless invocations
  max_lifetime: 60 * 10,
});

export default sql;