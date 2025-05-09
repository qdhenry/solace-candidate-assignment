import db from "../../../db";
import { advocates } from "../../../db/schema";
import { and, or, asc, desc, count, ilike, SQL, sql } from "drizzle-orm"; // Added sql import and arrayContains


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Pagination
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  // Filtering
  const name = searchParams.get("name");
  const city = searchParams.get("city");
  const degree = searchParams.get("degree");
  const specialty = searchParams.get("specialty"); // Read specialty parameter

  // Sorting
  const sort = searchParams.get("sort") || "city"; // Default to firstName
  const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  // Build WHERE clause conditions
  const whereConditions: SQL[] = []; // SQL type from drizzle-orm

  if (name) {
    // Using ilike for case-insensitive search (PostgreSQL specific)
    // Ensure ilike results are treated as SQL, though they should be by default.
    // This explicit handling is to try and satisfy the strict type checker if it's misinterpreting.
    const firstNameCondition = ilike(advocates.firstName, `%${name}%`);
    const lastNameCondition = ilike(advocates.lastName, `%${name}%`);
    // 'or' can return SQL | undefined. We must ensure we only push SQL to whereConditions.
    const combinedNameCondition = or(firstNameCondition, lastNameCondition);
    if (combinedNameCondition) {
        whereConditions.push(combinedNameCondition);
    }
  }
  if (city) {
    whereConditions.push(ilike(advocates.city, `%${city}%`));
  }
  if (degree) {
    whereConditions.push(ilike(advocates.degree, `%${degree}%`));
  }
  if (specialty) {
    // Case-insensitive check if the jsonb array 'specialties' contains the given 'specialty' string.
    // This uses a subquery with jsonb_array_elements_text to unnest the array,
    // converts both the unnested element and the input specialty to lowercase, and checks for equality.
    whereConditions.push(
      sql`EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(${advocates.specialties}) AS elem
        WHERE lower(elem) = lower(${specialty})
      )`
    );
  }

  const finalWhereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Sorting
  // Map API sort parameters to database columns
  const sortColumnMap: Record<string, typeof advocates.id | typeof advocates.firstName | typeof advocates.lastName | typeof advocates.city | typeof advocates.degree | typeof advocates.yearsOfExperience> = { // Removed advocates.createdAt
    id: advocates.id,
    firstName: advocates.firstName,
    lastName: advocates.lastName,
    city: advocates.city,
    degree: advocates.degree,
    // createdAt: advocates.createdAt, // Removed
    yearsOfExperience: advocates.yearsOfExperience,
  };

  // Validate sort parameter and select column, default to 'firstName'
  const sortFieldKey = Object.keys(sortColumnMap).includes(sort) ? sort : "city"; // Default to firstName
  const columnToSort = sortColumnMap[sortFieldKey];
  let orderByCondition;

  if (order === "asc") {
    orderByCondition = asc(columnToSort);
  } else {
    orderByCondition = desc(columnToSort); // Default order 'desc' is handled by initial param parsing
  }

  // Fetch paginated data
  // Start with a base query object.
  // Explicitly type the initial query builder to help TypeScript.
  // Note: The actual type might be more specific like PgSelect
  // Fetch paginated data
  // Build the main query
  // Define a default true condition if no filters are applied
  // This helps maintain a consistent query structure for TypeScript type inference.
  const effectiveWhereCondition = finalWhereCondition; // Can be SQL or undefined

  // Using Drizzle's relational query API
  const findManyOptions: Parameters<typeof db.query.advocates.findMany>[0] = {
    orderBy: orderByCondition,
    limit: limit,
    offset: offset,
  };

  if (effectiveWhereCondition) {
    findManyOptions.where = effectiveWhereCondition;
  }

  const paginatedData = await db.query.advocates.findMany(findManyOptions).catch((error) => {
    console.error("Error fetching paginated data:", error);
    return [];
  });

  // Fetch total count for pagination using the standard select/count approach
  const baseCountQuery = db.select({ value: count() }).from(advocates);
  const countQuery = effectiveWhereCondition
    ? baseCountQuery.where(effectiveWhereCondition)
    : baseCountQuery;
  const totalResult = await countQuery.catch((error) => {
    console.error("Error fetching total count:", error);
    return [{ value: 0 }];
  });
  const total = totalResult[0]?.value || 0;
  const totalPages = Math.ceil(total / limit);

  return Response.json({
    data: paginatedData,
    total,
    page,
    totalPages,
  });
}
