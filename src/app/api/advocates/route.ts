import db from "../../../db";
import { advocates } from "../../../db/schema";
import { and, or, ilike, eq, sql } from "drizzle-orm";

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

  // Sorting
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  // Build where clause
  // Fetch all data, then filter, sort, and paginate in memory
  const allRows = await db.select().from(advocates);

  // Filtering
  let filtered = allRows;
  if (name) {
    const nameLower = name.toLowerCase();
    filtered = filtered.filter(
      (row: any) =>
        row.firstName.toLowerCase().includes(nameLower) ||
        row.lastName.toLowerCase().includes(nameLower)
    );
  }
  if (city) {
    const cityLower = city.toLowerCase();
    filtered = filtered.filter(
      (row: any) => row.city.toLowerCase().includes(cityLower)
    );
  }
  if (degree) {
    const degreeLower = degree.toLowerCase();
    filtered = filtered.filter(
      (row: any) => row.degree.toLowerCase().includes(degreeLower)
    );
  }

  // Sorting
  const sortField = ["id", "firstName", "lastName", "city", "degree", "createdAt", "yearsOfExperience"].includes(sort)
    ? sort
    : "createdAt";
  filtered = filtered.sort((a: any, b: any) => {
    if (a[sortField] == null && b[sortField] == null) return 0;
    if (a[sortField] == null) return order === "asc" ? -1 : 1;
    if (b[sortField] == null) return order === "asc" ? 1 : -1;
    if (a[sortField] < b[sortField]) return order === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return Response.json({
    data: paginated,
    total,
    page,
    totalPages,
  });
}
