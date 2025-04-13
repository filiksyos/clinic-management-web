// "use server";
import { jwtDecode } from "jwt-decode";
import { FieldValues } from "react-hook-form";
import setAccessToken from "./setAccessToken";

export const userLogin = async (data: FieldValues) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      }
    );

    const userInfo = await res.json();

    if (!userInfo?.data?.accessToken) {
      throw new Error(userInfo?.message || 'Login failed');
    }

    const decodedData = jwtDecode(userInfo.data.accessToken) as any;
    
    if (!decodedData?.role) {
      throw new Error('Invalid token: Role not found');
    }

    const role = decodedData.role.toLowerCase();
    let redirectUrl = "/dashboard";

    if (role === "admin") {
      redirectUrl = "/admin";
    } else if (role === "receptionist") {
      redirectUrl = "/receptionist";
    } else if (role === "doctor") {
      redirectUrl = "/doctor";
    } else if (role === "patient") {
      redirectUrl = "/patient";
    }

    setAccessToken(userInfo.data.accessToken, {
      redirect: redirectUrl,
    });

    return userInfo;
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
};
