'use client';

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// User role credentials
const userCredentials = {
  receptionist: {
    email: "receptionist@clinic.com",
    password: "clinic123",
  },
  doctor: {
    email: "doctor@clinic.com", // Assuming same password for doctor for now
    password: "clinic123",
  }
};

const LoginPage = () => {
  const [formValues, setFormValues] = useState({
    email: userCredentials.receptionist.email,
    password: userCredentials.receptionist.password,
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Sign in handled by AuthContext now, including redirection
      const { error } = await signIn(formValues.email, formValues.password);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login successful! Redirecting...");
        // Redirection is handled within AuthContext after successful sign-in
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to set default credentials based on selected role
  const setUserCredentials = (role: 'receptionist' | 'doctor') => {
    setFormValues({
      email: userCredentials[role].email,
      password: userCredentials[role].password,
    });
    toast.info(`${role.charAt(0).toUpperCase() + role.slice(1)} credentials loaded.`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg rounded-lg">
        <div className="bg-white">
          {/* Welcome Section */}
          <div className="bg-[#D4DBF9] pt-7 pb-10 pl-4 mb-10 rounded">
            <h5 className="text-[#485EC4] font-medium text-lg">
              Welcome Back!
            </h5>
            <p className="text-[#485EC4] text-sm">
              Sign in to continue to Clinic Management.
            </p>
          </div>

          {/* Login Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full rounded-md bg-[#485EC4] px-4 py-2 text-white hover:bg-[#3A4B9E]"
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>

            {/* Default Credentials Information */}
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="text-md text-gray-500 font-medium mb-3">Use Default Credentials:</h3>
              <div className="flex gap-3">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setUserCredentials('receptionist')} 
                   disabled={isLoading}
                   className="flex-1"
                 >
                   Receptionist
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={() => setUserCredentials('doctor')} 
                   disabled={isLoading}
                   className="flex-1"
                 >
                   Doctor
                 </Button>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p>Email: {formValues.email}</p>
                <p>Password: {formValues.password}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <p className="text-sm mt-2 text-center text-gray-600">
          © {new Date().getFullYear()} Clinic Management. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 