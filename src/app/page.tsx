"use client";

import { useEffect, useState, useRef } from "react";
import { advocates } from "@/db/schema";
type Advocate = typeof advocates.$inferSelect;

import Header from "./Header";
import formatPhoneNumber from "@/utils/helpers";

// Main fields for sorting
const SORT_FIELDS = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "city", label: "City" },
  { value: "degree", label: "Degree" },
  { value: "yearsOfExperience", label: "Years of Experience" },
  { value: "createdAt", label: "Created At" },
];

export default function Home() {
  // State for API data and UI controls
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Filter/sort state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [degree, setDegree] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  // Debounce refs
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch advocates from API
  const fetchAdvocates = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
    });
    if (name) params.append("name", name);
    if (city) params.append("city", city);
    if (degree) params.append("degree", degree);

    fetch(`/api/advocates?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        setAdvocates(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      })
      .finally(() => setLoading(false));
  };

  // Debounced fetch on filter/sort/page change
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchAdvocates();
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, name, city, degree, sort, order]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, city, degree, sort, order]);

  // Handlers for filter/sort controls
  const handleInput = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };
  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  };
  const handleOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(e.target.value as "asc" | "desc");
  };
  const handleReset = () => {
    setName("");
    setCity("");
    setDegree("");
    setSort("createdAt");
    setOrder("desc");
  };

  // Pagination controls
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <>
      <Header />
      <main className="bg-background-subtle min-h-screen flex justify-center items-start py-12">
        <div className="max-w-5xl w-full px-4">
          <h1 className="text-5xl font-headline text-text-color-primary mb-2 text-center">Solace Advocates</h1>
          <p className="text-lg text-text-color-secondary mb-8 text-center">
            Find the right advocate for your needs.
          </p>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col gap-4 gap-y-6 md:flex-row md:items-end">
              <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="name" className="block text-sm font-medium text-text-color-secondary mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full border border-solace-green rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-solace-gold transition text-text-color-secondary"
                    placeholder="Search by name"
                    value={name}
                    onChange={handleInput(setName)}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="city" className="block text-sm font-medium text-text-color-secondary mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="w-full border border-solace-green rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-solace-gold transition text-text-color-secondary"
                    placeholder="Search by city"
                    value={city}
                    onChange={handleInput(setCity)}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="degree" className="block text-sm font-medium text-text-color-secondary mb-1">
                    Degree
                  </label>
                  <input
                    id="degree"
                    type="text"
                    className="w-full border border-solace-green rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-solace-gold transition text-text-color-secondary"
                    placeholder="Search by degree"
                    value={degree}
                    onChange={handleInput(setDegree)}
                  />
                </div>
              </div>
              <div className="flex flex-row gap-4 items-end mt-4 md:mt-0">
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-text-color-secondary mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    className="border border-solace-green rounded-md px-2 py-2"
                    value={sort}
                    onChange={handleSort}
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
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                </div>
                <button
                  onClick={handleReset}
                  className="h-12 bg-solace-green text-text-color-white font-medium px-6 py-2 rounded-md shadow hover:bg-solace-green/90 focus:outline-none focus:ring-2 focus:ring-solace-gold transition whitespace-nowrap"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg shadow min-h-[200px]">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="text-solace-green font-semibold text-lg">Loading advocates...</span>
              </div>
            ) : (
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light">
                      First Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light">
                      Last Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light">
                      City
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light">
                      Degree
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light">
                      Specialties
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light">
                      Years of Experience
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-solace-green bg-solace-green-light w-[200px]">
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
                          className="btn-secondary inline-flex items-center justify-center gap-2 text-xs"
                          aria-label={`Call ${formatPhoneNumber(advocate.phoneNumber)}`}
                          tabIndex={0}
                        >
                          <span className="whitespace-nowrap font-medium">{formatPhoneNumber(advocate.phoneNumber)}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 text-solace-green">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                  {advocates.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-text-color-muted">
                        No advocates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-text-color-secondary">
              Page {page} of {totalPages} ({total} total results)
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded bg-solace-green text-white font-medium disabled:bg-gray-300 disabled:text-gray-500"
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={page === totalPages || loading}
                className="px-4 py-2 rounded bg-solace-green text-white font-medium disabled:bg-gray-300 disabled:text-gray-500"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
