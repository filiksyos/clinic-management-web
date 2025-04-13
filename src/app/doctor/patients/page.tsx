"use client";

import { useEffect, useState } from "react";
import { getPatients } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { FaUserInjured } from "react-icons/fa";
import Link from "next/link";

export default function DoctorPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="pt-2 px-[18px]">
      <div className="flex justify-between pb-6">
        <h1 className="font-semibold text-gray-800 uppercase tracking-wide">
          Patients
        </h1>
      </div>

      <div className="mb-6">
        <Card className="p-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaUserInjured className="text-blue-600 text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {patient.gender}, {patient.age} years
                      </p>
                      <div className="mt-4">
                        <Link 
                          href={`/doctor/records?patient=${patient.id}`}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View Records
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUserInjured className="mx-auto text-gray-400 text-4xl mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Patients Found</h3>
              <p className="text-gray-500">No patients match your search criteria.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 