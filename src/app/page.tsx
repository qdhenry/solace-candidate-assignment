"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { advocates } from "@/db/schema"; // Import the table schema

// Infer the Advocate type from the Drizzle schema
type Advocate = typeof advocates.$inferSelect;

import Header from "./Header";
import formatPhoneNumber from "@/utils/helpers";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log("fetching advocates...");
    fetch("/api/advocates").then((response) => {
      response.json().then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      });
    });
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);

    console.log("filtering advocates...");
    const filteredAdvocates = advocates.filter((advocate: Advocate) => {
      return (
        advocate.firstName.includes(searchTerm) ||
        advocate.lastName.includes(searchTerm) ||
        advocate.city.includes(searchTerm) ||
        advocate.degree.includes(searchTerm) ||
        advocate.specialties.includes(searchTerm) ||
        advocate.yearsOfExperience.toString().includes(searchTerm)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    console.log("resetting search...");
    setSearchTerm("");
    setFilteredAdvocates(advocates);
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col gap-4 gap-y-6 md:flex-row md:items-center">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-text-color-secondary mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    id="search"
                    type="text"
                    className="w-full border border-solace-green rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-solace-gold transition text-text-color-secondary"
                    placeholder="Search by name, city, degree, specialty, or years of experience"
                    onChange={onChange}
                    aria-label="Search advocates"
                  />
                  {searchTerm ? (
                    <p className="text-xs text-text-color-muted mt-1 absolute left-0 top-full">
                      Searching for: <span id="search-term" className="font-semibold text-solace-green">{searchTerm}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-text-color-muted mt-1 absolute left-0 top-full invisible" aria-hidden="true">
                      Searching for: <span className="font-semibold text-solace-green">&nbsp;</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClick}
                className="h-12 md:ml-6 bg-solace-green text-text-color-white font-medium px-8 py-2 rounded-md shadow hover:bg-solace-green/90 focus:outline-none focus:ring-2 focus:ring-solace-gold transition whitespace-nowrap self-end"
                type="button"
                style={{ marginTop: 0 }}
              >
                reset search
              </button>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg shadow">
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
                {filteredAdvocates.map((advocate: Advocate, idx: number) => (
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
                    
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 text-solace-green">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                ))}
                {filteredAdvocates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-text-color-muted">
                      No advocates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
