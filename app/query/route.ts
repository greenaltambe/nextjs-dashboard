// app/api/query/route.ts
import postgres from "postgres";

const DATABASE_URL =
	process.env.storage_POSTGRES_URL_NON_POOLING ||
	process.env.storage_POSTGRES_URL ||
	process.env.POSTGRES_URL;

if (!DATABASE_URL) {
	console.error(
		"No DATABASE_URL found. Set storage_POSTGRES_URL or storage_POSTGRES_URL_NON_POOLING."
	);
}

// For Supabase/pgbouncer use non-pooling when possible. Accept self-signed certs if present.
const sql = postgres(DATABASE_URL!, {
	ssl: { rejectUnauthorized: false },
	// adjust connection options if needed
});

async function listInvoices() {
	// correct: SQL in template only, return data afterwards
	const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;
	return data;
}

export async function GET() {
	try {
		const rows = await listInvoices();
		console.log("Query result:", rows);
		return new Response(JSON.stringify(rows), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("DB query failed:", error);
		return new Response(JSON.stringify({ error: String(error) }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	} finally {
		// optional: close connection if you want to avoid leaked connections in dev
		try {
			await sql.end({ timeout: 1 });
		} catch (e) {
			// ignore
		}
	}
}
