// src/utils/advocateUtils.ts
import { ReadonlyURLSearchParams } from "next/navigation";
import { advocates as TAdvocates } from "@/db/schema"; // Assuming schema export

/**
 * Updates URL query parameters.
 * @param currentSearchParams The current URLSearchParams object.
 * @param paramsToUpdate An object containing the query parameters to update.
 * @returns A string representing the new query parameters.
 */
export const updateQueryParams = (
  currentSearchParams: ReadonlyURLSearchParams,
  paramsToUpdate: Record<string, string | number | undefined>
): string => {
  const current = new URLSearchParams(currentSearchParams.toString());
  Object.entries(paramsToUpdate).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) {
      current.delete(key);
    } else {
      current.set(key, String(value));
    }
  });
  return current.toString();
};

export type Advocate = typeof TAdvocates.$inferSelect;

export interface FetchAdvocatesParams {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  name?: string;
  city?: string;
  degree?: string;
  specialty?: string;
}

export interface AdvocateData {
  data: Advocate[];
  totalPages: number;
  total: number;
}

export interface FetchAdvocatesResult {
  success: boolean;
  data?: AdvocateData;
  error?: string;
}

export const fetchAdvocatesAPI = async (
  fetchParams: FetchAdvocatesParams
): Promise<FetchAdvocatesResult> => {
  const params = new URLSearchParams({
    page: fetchParams.page.toString(),
    limit: fetchParams.limit.toString(),
    sort: fetchParams.sort,
    order: fetchParams.order,
  });
  if (fetchParams.name) params.append("name", fetchParams.name);
  if (fetchParams.city) params.append("city", fetchParams.city);
  if (fetchParams.degree) params.append("degree", fetchParams.degree);
  if (fetchParams.specialty) params.append("specialty", fetchParams.specialty);

  try {
    const res = await fetch(`/api/advocates?${params.toString()}`);
    if (!res.ok) {
      const text = await res.text();
      // Try to parse as JSON for a structured error message if available
      try {
        const errorJson = JSON.parse(text);
        throw new Error(errorJson.error || errorJson.message || "Failed to fetch advocates.");
      } catch (e) {
        throw new Error(text || "Failed to fetch advocates.");
      }
    }
    const json = await res.json(); // Assumes API returns { data: Advocate[], totalPages: number, total: number }
    return { success: true, data: json };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};
