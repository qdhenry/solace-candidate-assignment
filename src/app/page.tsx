"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { advocates } from "@/db/schema";

import Header from "./Header";
import formatPhoneNumber from "@/utils/helpers";
import { updateQueryParams, fetchAdvocatesAPI, type Advocate } from "@/utils/advocateUtils"; // Added fetchAdvocatesAPI and Advocate type

// shadcn/ui components

// Main fields for sorting
import { SORT_FIELDS, SPECIALTY_OPTIONS } from "@/db/constants";

function PageContent() {
  // Next.js router and search params
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for API data and UI controls
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State initialized from URL query params
  const [page, setPage] = useState(() => {
    const p = Number(searchParams.get("page"));
    return isNaN(p) || p < 1 ? 1 : p;
  });
  // Unified fuzzy search input (multi-field)
  const [search, setSearch] = useState(() => {
    const n = searchParams.get("name") || "";
    const c = searchParams.get("city") || "";
    const d = searchParams.get("degree") || "";
    // Compose a single string for the search bar
    return [n, c, d].filter(Boolean).join(" ");
  });
  const [name, setName] = useState(() => searchParams.get("name") || "");
  const [city, setCity] = useState(() => searchParams.get("city") || "");
  const [degree, setDegree] = useState(() => searchParams.get("degree") || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState(() => searchParams.get("specialty") || "");
  const [sort, setSort] = useState(() => searchParams.get("sort") || "firstName"); // Default to firstName
  const [order, setOrder] = useState<"asc" | "desc">(
    searchParams.get("order") === "asc" ? "asc" : "desc"
  );
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Debounce ref
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // For existing filter/sort/page changes
  const searchDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For reactive search input

  // Unified state update for filters/sort/page, always updates URL
  const setFilterState = (updates: Partial<{
    page: number;
    name: string;
    city: string;
    degree: string;
    specialty?: string; // Added specialty
    sort: string;
    order: "asc" | "desc";
  }>) => {
    // If any filter (except page) changes, reset page to 1
    const resetPage =
      "name" in updates ||
      "city" in updates ||
      "degree" in updates ||
      "specialty" in updates || // Added specialty
      "sort" in updates ||
      "order" in updates;
    const newPage = resetPage ? 1 : updates.page ?? page;
    setPage(newPage);
    if ("name" in updates) setName(updates.name ?? "");
    if ("city" in updates) setCity(updates.city ?? "");
    if ("degree" in updates) setDegree(updates.degree ?? "");
    if ("specialty" in updates) setSelectedSpecialty(updates.specialty ?? ""); // Added specialty
    if ("sort" in updates) setSort(updates.sort ?? "firstName"); // Default to firstName
    if ("order" in updates) setOrder(updates.order ?? "desc");

    // Use the new utility function
    const newQueryString = updateQueryParams(searchParams, {
      page: newPage,
      name: updates.name ?? name,
      city: updates.city ?? city,
      degree: updates.degree ?? degree,
      specialty: updates.specialty ?? selectedSpecialty, // Added specialty
      sort: updates.sort ?? sort,
      order: updates.order ?? order,
    });
    router.replace(`?${newQueryString}`);
  };

  // Fetch advocates from API with error handling
  const fetchAdvocates = async () => {
    setLoading(true);
    setError(null);

    const result = await fetchAdvocatesAPI({
      page,
      limit, // limit is a constant (10) in this component
      sort,
      order,
      name: name || undefined,
      city: city || undefined,
      degree: degree || undefined,
      specialty: selectedSpecialty || undefined,
    });

    if (result.success && result.data) {
      setAdvocates(result.data.data);
      setTotalPages(result.data.totalPages);
      setTotal(result.data.total);
    } else {
      setError(result.error || "An unknown error occurred while fetching advocates.");
      setAdvocates([]);
      setTotalPages(1);
      setTotal(0);
    }
    setLoading(false);
  };

  // Debounced fetch on filter/sort/page change, prevent double-fetching
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchAdvocates();
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, name, city, degree, selectedSpecialty, sort, order]); // Added selectedSpecialty

  // New useEffect for reactive search input
  useEffect(() => {
    if (searchDebounceTimeoutRef.current) {
      clearTimeout(searchDebounceTimeoutRef.current);
    }
    searchDebounceTimeoutRef.current = setTimeout(() => {
      const trimmedSearch = search.trim();
      if (trimmedSearch.length > 2) {
        const [n, c, d] = trimmedSearch.split(" ");
        // Only update if the parsed values differ from current state to avoid unnecessary re-renders/fetches
        // or if the search term itself has meaningfully changed the filter intent.
        // For simplicity here, we'll update if the search term is long enough.
        // A more sophisticated check might compare n, c, d with current name, city, degree.
        setFilterState({
          name: n || undefined, // Use undefined to clear if not present
          city: c || undefined,
          degree: d || undefined,
        });
      } else {
        // If search is short, clear the name, city, degree filters if they are currently set
        if (name || city || degree) {
          setFilterState({
            name: undefined,
            city: undefined,
            degree: undefined,
          });
        }
      }
    }, 500); // 500ms debounce for search input

    return () => {
      if (searchDebounceTimeoutRef.current) {
        clearTimeout(searchDebounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // Only re-run when the main 'search' state changes

  // Sync state with URL on mount (for back/forward navigation)
  useEffect(() => {
    // Only update state if URL params differ from state
    const urlPage = Number(searchParams.get("page")) || 1;
    if (urlPage !== page) setPage(urlPage);
    if ((searchParams.get("name") || "") !== name) setName(searchParams.get("name") || "");
    if ((searchParams.get("city") || "") !== city) setCity(searchParams.get("city") || "");
    if ((searchParams.get("degree") || "") !== degree) setDegree(searchParams.get("degree") || "");
    if ((searchParams.get("specialty") || "") !== selectedSpecialty) setSelectedSpecialty(searchParams.get("specialty") || "");
    if ((searchParams.get("sort") || "firstName") !== sort) setSort(searchParams.get("sort") || "firstName"); // Default to firstName
    if ((searchParams.get("order") || "desc") !== order) setOrder(
      searchParams.get("order") === "asc" ? "asc" : "desc"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);



  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState({ specialty: e.target.value });
  };
  // Fuzzy search handler: parse input and update fields
  const handleFuzzySearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simple parsing: split by space, assign to fields in order (name, city, degree)
    // For a more advanced UI, use chips or separate fields, but here we keep it simple
    const value = search.trim();
    const [n, c, d] = value.split(" ");
    setFilterState({
      name: n || "",
      city: c || "",
      degree: d || "",
    });
  };
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState({ sort: e.target.value });
  };
  const handleOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState({ order: e.target.value as "asc" | "desc" });
  };
  const handleReset = () => {
    setSearch(""); // Clear the main search bar as well
    setFilterState({
      name: "",
      city: "",
      degree: "",
      specialty: "", // Reset specialty
      sort: "firstName", // Default to firstName
      order: "desc",
      page: 1,
    });
  };

  // Pagination controls
  const prevPage = () => {
    if (page > 1) setFilterState({ page: page - 1 });
  };
  const nextPage = () => {
    if (page < totalPages) setFilterState({ page: page + 1 });
  };

  // Direct page navigation
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setFilterState({ page: val });
    }
  };

  // Page number buttons (for up to 7 pages, else show window)
  const renderPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (page <= 3) {
      end = Math.min(5, totalPages);
    }
    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setFilterState({ page: i })}
          disabled={i === page || loading}
          className={`px-3 py-1 rounded ${i === page ? "bg-solace-gold text-black font-bold" : "bg-solace-green text-white"} font-medium disabled:bg-gray-300 disabled:text-gray-500`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <>
      <Header />
      <main className="bg-background-subtle min-h-screen flex justify-center items-start py-12">
        <div className="max-w-5xl w-full px-4">
          <h1 className="text-5xl font-headline text-text-color-primary mb-2 text-center">Solace Advocates</h1>
          <p className="text-lg text-text-color-secondary mb-8 text-center">
            Find the right advocate for your needs.
          </p>
          {/* Fuzzy Search Bar */}
          <div className="mb-8">
            <form
              onSubmit={handleFuzzySearch}
              className="flex flex-col md:flex-row items-center gap-4 w-full"
              role="search"
              aria-label="Fuzzy search advocates"
            >
              <div className="flex-1 flex items-center bg-white border-2 border-solace-green rounded-lg shadow-lg px-4 py-3 focus-within:ring-2 focus-within:ring-solace-gold transition">
                {/* Inline search icon (magnifying glass) */}
                <svg
                  className="text-solace-green mr-3 w-6 h-6"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, city, or degree"
                  className="flex-1 text-lg border-none outline-none focus:ring-0 bg-transparent"
                  aria-label="Search by name, city, or degree"
                  autoFocus
                />
                <button
                  type="submit"
                  className="ml-3 px-6 py-2 text-lg font-semibold bg-solace-gold text-black rounded-md shadow hover:bg-solace-gold/90 focus:outline-none focus:ring-2 focus:ring-solace-green"
                  aria-label="Search"
                >
                  <span className="flex items-center gap-2">
                    {/* Inline search icon (smaller) */}
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Search
                  </span>
                </button>
              </div>
              <button
                onClick={handleReset}
                className="h-12 bg-solace-green text-text-color-white font-medium px-6 py-2 rounded-md shadow hover:bg-solace-green/90 focus:outline-none focus:ring-2 focus:ring-solace-gold transition whitespace-nowrap"
                type="button"
                aria-label="Reset filters"
              >
                Reset
              </button>
            </form>
          </div>
          {/* Filters and sort controls */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-row justify-between items-end"> {/* Changed to justify-between */}
              {/* Specialty Filter Dropdown */}
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-text-color-secondary mb-1">
                  Filter by Specialty
                </label>
                <select
                  id="specialty"
                  className="border border-solace-green rounded-md px-2 py-2"
                  value={selectedSpecialty}
                  onChange={handleSpecialtyChange}
                  aria-label="Filter by specialty"
                >
                  {SPECIALTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort and Order Controls Group - Pushed to the right */}
              <div className="flex flex-row gap-4 items-end">
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-text-color-secondary mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    className="border border-solace-green rounded-md px-2 py-2"
                    value={sort}
                    onChange={handleSort}
                    aria-label="Sort by"
                  >
                    {SORT_FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-text-color-secondary mb-1">
                    Order
                  </label>
                  <select
                    id="order"
                    className="border border-solace-green rounded-md px-2 py-2"
                    value={order}
                    onChange={handleOrder}
                    aria-label="Sort order"
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg shadow min-h-[200px]">
            {error && (
              <div className="flex justify-center items-center py-6">
                <span className="text-red-600 font-semibold text-lg">{error}</span>
              </div>
            )}
            {loading && !error ? (
              <div className="flex flex-col justify-center items-center py-12 min-h-[200px] w-full">
                {/* Animated horizontal loading bar */}
                <div className="w-full max-w-md flex flex-col items-center">
                  <div className="relative w-full h-2 bg-gray-200 rounded overflow-hidden mb-6">
                    <div className="absolute left-0 top-0 h-2 w-1/3 bg-solace-green animate-[loading-bar_1.2s_ease-in-out_infinite] rounded" />
                  </div>
                  <span className="text-solace-green font-semibold text-lg text-center">
                    searching for advocates
                  </span>
                </div>
                {/* Tailwind animation keyframes (add to globals.css if not present):
                  @keyframes loading-bar {
                    0% { left: -33%; width: 33%; }
                    50% { left: 33%; width: 33%; }
                    100% { left: 100%; width: 33%; }
                  }
                */}
              </div>
            ) : (
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light cursor-pointer select-none"
                      role="columnheader"
                      aria-sort={sort === "firstName" ? (order === "asc" ? "ascending" : "descending") : "none"}
                      tabIndex={0}
                      onClick={() => setFilterState({ sort: "firstName", order: sort === "firstName" && order === "asc" ? "desc" : "asc" })}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setFilterState({ sort: "firstName", order: sort === "firstName" && order === "asc" ? "desc" : "asc" }); }}
                      aria-label="Sort by First Name"
                    >
                      First Name
                      {sort === "firstName" && (
                        <span aria-hidden="true" className="ml-1">{order === "asc" ? "▲" : "▼"}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light cursor-pointer select-none"
                      role="columnheader"
                      aria-sort={sort === "lastName" ? (order === "asc" ? "ascending" : "descending") : "none"}
                      tabIndex={0}
                      onClick={() => setFilterState({ sort: "lastName", order: sort === "lastName" && order === "asc" ? "desc" : "asc" })}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setFilterState({ sort: "lastName", order: sort === "lastName" && order === "asc" ? "desc" : "asc" }); }}
                      aria-label="Sort by City"
                    >
                      City
                      {sort === "city" && (
                        <span aria-hidden="true" className="ml-1">{order === "asc" ? "▲" : "▼"}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light cursor-pointer select-none"
                      role="columnheader"
                      aria-sort={sort === "city" ? (order === "asc" ? "ascending" : "descending") : "none"}
                      tabIndex={0}
                      onClick={() => setFilterState({ sort: "city", order: sort === "city" && order === "asc" ? "desc" : "asc" })}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setFilterState({ sort: "city", order: sort === "city" && order === "asc" ? "desc" : "asc" }); }}
                      aria-label="Sort by City"
                    >
                      City
                      {sort === "city" && (
                        <span aria-hidden="true" className="ml-1">{order === "asc" ? "▲" : "▼"}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light cursor-pointer select-none"
                      role="columnheader"
                      aria-sort={sort === "degree" ? (order === "asc" ? "ascending" : "descending") : "none"}
                      tabIndex={0}
                      onClick={() => setFilterState({ sort: "degree", order: sort === "degree" && order === "asc" ? "desc" : "asc" })}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setFilterState({ sort: "degree", order: sort === "degree" && order === "asc" ? "desc" : "asc" }); }}
                      aria-label="Sort by Degree"
                    >
                      Degree
                      {sort === "degree" && (
                        <span aria-hidden="true" className="ml-1">{order === "asc" ? "▲" : "▼"}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light"
                      role="columnheader"
                      aria-label="Specialties"
                    >
                      Specialties
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light cursor-pointer select-none"
                      role="columnheader"
                      aria-sort={sort === "yearsOfExperience" ? (order === "asc" ? "ascending" : "descending") : "none"}
                      tabIndex={0}
                      onClick={() => setFilterState({ sort: "yearsOfExperience", order: sort === "yearsOfExperience" && order === "asc" ? "desc" : "asc" })}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setFilterState({ sort: "yearsOfExperience", order: sort === "yearsOfExperience" && order === "asc" ? "desc" : "asc" }); }}
                      aria-label="Sort by Years of Experience"
                    >
                      Years of Experience
                      {sort === "yearsOfExperience" && (
                        <span aria-hidden="true" className="ml-1">{order === "asc" ? "▲" : "▼"}</span>
                      )}
                    </th>
                    <th
                      className="px-4 py-3 text-left font-semibold text-solace-green bg-solace-green-light w-[200px]"
                      role="columnheader"
                      aria-label="Phone Number"
                    >
                      Phone Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {advocates.map((advocate: Advocate, idx: number) => (
                    <tr
                      key={advocate.id}
                      className={idx % 2 === 0 ? "bg-background-subtle" : "bg-white"}
                    >
                      <td className="px-4 py-3 text-text-color-secondary">{advocate.firstName}</td>
                      <td className="px-4 py-3 text-text-color-secondary">{advocate.lastName}</td>
                      <td className="px-4 py-3 text-text-color-secondary">{advocate.city}</td>
                      <td className="px-4 py-3 text-text-color-secondary">{advocate.degree}</td>
                      <td className="px-4 py-3 text-text-color-secondary text-left max-w-[300px] flex flex-wrap gap-2">
                        {advocate.specialties.map((s: string, index: number) => (
                          <span
                            key={`${s}-${index}`}
                            className="inline-block bg-solace-gold/30 text-black rounded px-2 py-0.5 mr-1 mb-1 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-text-color-secondary">{advocate.yearsOfExperience}</td>
                      <td className="px-4 py-3 text-center w-[100px]">
                        <a
                          href={`tel:${advocate.phoneNumber}`}
                          className="btn-secondary inline-flex items-center justify-center gap-2"
                          aria-label={`Call ${formatPhoneNumber(advocate.phoneNumber)}`}
                          tabIndex={0}
                        >
                          <span className="whitespace-nowrap font-medium">{formatPhoneNumber(advocate.phoneNumber)}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                  {advocates.length === 0 && !loading && !error && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-text-color-muted">
                        <span className="block text-lg font-semibold mb-2">No advocates found.</span>
                        <span className="block text-base text-text-color-secondary">
                          Try expanding your search criteria to see more results.
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
            <div className="text-sm text-text-color-secondary">
              Page {page} of {totalPages} ({total} total results)
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={prevPage}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded bg-solace-green text-white font-medium disabled:bg-gray-300 disabled:text-gray-500"
              >
                Previous
              </button>
              {renderPageNumbers()}
              <button
                onClick={nextPage}
                disabled={page === totalPages || loading}
                className="px-4 py-2 rounded bg-solace-green text-white font-medium disabled:bg-gray-300 disabled:text-gray-500"
              >
                Next
              </button>
              <span className="ml-2 text-sm">Go to page:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={handlePageInput}
                className="w-16 border border-solace-green rounded-md px-2 py-1 text-center text-white"
                disabled={loading || totalPages < 2}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading page content...</div>}> {/* You can use a more sophisticated loader here */}
      <PageContent />
    </Suspense>
  );
}
