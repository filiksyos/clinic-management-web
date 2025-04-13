'use client';

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/lib/supabase";

// Default receptionist credentials
const receptionistCredentials = {
  email: "receptionist@clinic.com",
  password: "clinic123",
};

// Default doctor credentials
const doctorCredentials = {
  email: "doctornew@clinic.com",
  password: "password123",
};

const LoginPage = () => {
  const [formValues, setFormValues] = useState({
    email: receptionistCredentials.email,
    password: receptionistCredentials.password,
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
      const { data, error } = await signIn(formValues.email, formValues.password);

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      toast.success("Login successful!");
      
      // Redirect based on user role
      const userRole = data.user?.app_metadata?.role as UserRole;
      if (userRole === 'doctor') {
        window.location.href = '/doctor';
      } else {
        window.location.href = '/dashboard';
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (type: 'receptionist' | 'doctor') => {
    if (type === 'receptionist') {
      setFormValues({
        email: receptionistCredentials.email,
        password: receptionistCredentials.password,
      });
    } else {
      setFormValues({
        email: doctorCredentials.email,
        password: doctorCredentials.password,
      });
    }
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
                className="mt-4 w-full rounded-md bg-[#485EC4] px-4 py-2 text-white"
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </form>

            {/* Demo Login Options */}
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="text-md text-gray-700 font-medium mb-3">Quick Login Options:</h3>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => handleDemoLogin('receptionist')}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  Login as Receptionist
                </Button>
                <Button 
                  onClick={() => handleDemoLogin('doctor')}
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={isLoading}
                >
                  Login as Doctor
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm text-gray-500 mb-2">Login Credentials:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Receptionist:</strong> {receptionistCredentials.email} / {receptionistCredentials.password}</p>
                  <p><strong>Doctor:</strong> {doctorCredentials.email} / {doctorCredentials.password}</p>
                </div>
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