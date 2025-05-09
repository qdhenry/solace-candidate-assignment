import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js"; // Import PostgresJsDatabase
import postgres from "postgres";
import * as schema from "./schema";

// Define the expected return type for the database instance
type AppDb = PostgresJsDatabase<typeof schema>;

const setup = (): AppDb => { // Explicitly type the return value of setup
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Returning a minimal mock DB object.");
    // This is a minimal mock. If extensive DB operations are needed in the fallback,
    // this mock would need to be more comprehensive. The 'as AppDb' is a type assertion.
    return {
      query: {
        advocates: {
          findMany: async (_options: any) => [], // Mocked findMany
          count: async (_options: any) => ({ count: 0 }), // Mocked count
        },
        // Mock other tables from schema if necessary for fallback paths
      },
      // Mock other top-level db methods like select, insert, etc., if used by fallback paths
      select: (() => ({ from: (() => Promise.resolve([])) })) as any, // Minimal mock for select chain
      // Add other necessary methods like insert, update, delete if they are part of AppDb and used
    } as unknown as AppDb;
  }

  const queryClient = postgres(process.env.DATABASE_URL);
  // Explicitly type the db constant with AppDb and pass the schema
  const db: AppDb = drizzle(queryClient, { schema });
  return db;
};

export default setup();
