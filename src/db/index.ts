import { Client } from 'pg';

export const db = new Client({
	connectionString: process.env.POSTGRES_URL,
});
