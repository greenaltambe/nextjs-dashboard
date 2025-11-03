// manual_seed.js
import postgres from "postgres";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL =
	process.env.storage_POSTGRES_URL ||
	process.env.storage_POSTGRES_URL_NON_POOLING;
if (!DATABASE_URL) {
	console.error("Set storage_POSTGRES_URL in your environment.");
	process.exit(1);
}

// For Supabase/pgbouncer: do NOT use node-postgres pooling here, postgres lib is fine.
// Provide ssl: { rejectUnauthorized: false } to avoid cert issues with some providers.
const sql = postgres(DATABASE_URL, {
	ssl: { rejectUnauthorized: false },
	// You can tune max connections etc. if needed
});

const users = [
	{
		id: "410544b2-4001-4271-9855-fec4b6a6442a",
		name: "User",
		email: "user@nextmail.com",
		password: "123456",
	},
];

const customers = [
	{
		id: "d6e15727-9fe1-4961-8c5b-ea44a9bd81aa",
		name: "Evil Rabbit",
		email: "evil@rabbit.com",
		image_url: "/customers/evil-rabbit.png",
	},
	{
		id: "3958dc9e-712f-4377-85e9-fec4b6a6442a",
		name: "Delba de Oliveira",
		email: "delba@oliveira.com",
		image_url: "/customers/delba-de-oliveira.png",
	},
	{
		id: "3958dc9e-742f-4377-85e9-fec4b6a6442a",
		name: "Lee Robinson",
		email: "lee@robinson.com",
		image_url: "/customers/lee-robinson.png",
	},
	{
		id: "76d65c26-f784-44a2-ac19-586678f7c2f2",
		name: "Michael Novotny",
		email: "michael@novotny.com",
		image_url: "/customers/michael-novotny.png",
	},
	{
		id: "CC27C14A-0ACF-4F4A-A6C9-D45682C144B9",
		name: "Amy Burns",
		email: "amy@burns.com",
		image_url: "/customers/amy-burns.png",
	},
	{
		id: "13D07535-C59E-4157-A011-F8D2EF4E0CBB",
		name: "Balazs Orban",
		email: "balazs@orban.com",
		image_url: "/customers/balazs-orban.png",
	},
];

const invoices = [
	{
		customer_id: customers[0].id,
		amount: 15795,
		status: "pending",
		date: "2022-12-06",
	},
	{
		customer_id: customers[1].id,
		amount: 20348,
		status: "pending",
		date: "2022-11-14",
	},
	{
		customer_id: customers[4].id,
		amount: 3040,
		status: "paid",
		date: "2022-10-29",
	},
	{
		customer_id: customers[3].id,
		amount: 44800,
		status: "paid",
		date: "2023-09-10",
	},
	{
		customer_id: customers[5].id,
		amount: 34577,
		status: "pending",
		date: "2023-08-05",
	},
	{
		customer_id: customers[2].id,
		amount: 54246,
		status: "pending",
		date: "2023-07-16",
	},
	{
		customer_id: customers[0].id,
		amount: 666,
		status: "pending",
		date: "2023-06-27",
	},
	{
		customer_id: customers[3].id,
		amount: 32545,
		status: "paid",
		date: "2023-06-09",
	},
	{
		customer_id: customers[4].id,
		amount: 1250,
		status: "paid",
		date: "2023-06-17",
	},
	{
		customer_id: customers[5].id,
		amount: 8546,
		status: "paid",
		date: "2023-06-07",
	},
	{
		customer_id: customers[1].id,
		amount: 500,
		status: "paid",
		date: "2023-08-19",
	},
	{
		customer_id: customers[5].id,
		amount: 8945,
		status: "paid",
		date: "2023-06-03",
	},
	{
		customer_id: customers[2].id,
		amount: 1000,
		status: "paid",
		date: "2022-06-05",
	},
];

const revenue = [
	{ month: "Jan", revenue: 2000 },
	{ month: "Feb", revenue: 1800 },
	{ month: "Mar", revenue: 2200 },
	{ month: "Apr", revenue: 2500 },
	{ month: "May", revenue: 2300 },
	{ month: "Jun", revenue: 3200 },
	{ month: "Jul", revenue: 3500 },
	{ month: "Aug", revenue: 3700 },
	{ month: "Sep", revenue: 2500 },
	{ month: "Oct", revenue: 2800 },
	{ month: "Nov", revenue: 3000 },
	{ month: "Dec", revenue: 4800 },
];

async function seed() {
	await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

	await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;
	await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;
	await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;
	await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

	// users
	for (const u of users) {
		const hash = await bcrypt.hash(u.password, 10);
		await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${u.id}, ${u.name}, ${u.email}, ${hash})
      ON CONFLICT (id) DO NOTHING;
    `;
	}

	// customers
	for (const c of customers) {
		await sql`
      INSERT INTO customers (id, name, email, image_url)
      VALUES (${c.id}, ${c.name}, ${c.email}, ${c.image_url})
      ON CONFLICT (id) DO NOTHING;
    `;
	}

	// invoices
	for (const inv of invoices) {
		await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${inv.customer_id}, ${inv.amount}, ${inv.status}, ${inv.date})
      ON CONFLICT DO NOTHING;
    `;
	}

	// revenue
	for (const r of revenue) {
		await sql`
      INSERT INTO revenue (month, revenue)
      VALUES (${r.month}, ${r.revenue})
      ON CONFLICT (month) DO NOTHING;
    `;
	}

	console.log("Seeding done.");
	await sql.end({ timeout: 1000 }); // close connection
}

seed().catch((err) => {
	console.error("Seeding failed:", err);
	process.exit(1);
});
