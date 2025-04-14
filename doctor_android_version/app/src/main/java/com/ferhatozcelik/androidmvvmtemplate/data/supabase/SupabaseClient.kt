package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import android.util.Log
import com.ferhatozcelik.androidmvvmtemplate.BuildConfig
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

// Data classes for authentication
data class AuthResponse(
    @SerializedName("access_token") val accessToken: String?,
    @SerializedName("refresh_token") val refreshToken: String?,
    @SerializedName("user") val user: SupabaseUser?
)

data class SupabaseUser(
    @SerializedName("id") val id: String?,
    @SerializedName("email") val email: String?
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

// Retrofit interface for Supabase Auth API
interface SupabaseAuthAPI {
    @POST("auth/v1/token?grant_type=password")
    suspend fun login(
        @Body loginRequest: LoginRequest,
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Content-Type") contentType: String = "application/json"
    ): AuthResponse

    @POST("auth/v1/logout")
    suspend fun logout(
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Authorization") authToken: String
    )
}

/**
 * Manages Supabase authentication using direct REST API calls
 */
object SupabaseManager {
    private const val TAG = "SupabaseManager"
    
    // URL constants
    val supabaseUrl: String = BuildConfig.SUPABASE_URL
    val supabaseAnonKey: String = BuildConfig.SUPABASE_ANON_KEY
    
    // Session data
    private var currentAccessToken: String? = null
    private var currentUser: SupabaseUser? = null

    // Create HTTP client with logging
    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    // Create Retrofit instance
    private val authApi = Retrofit.Builder()
        .baseUrl(supabaseUrl)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(SupabaseAuthAPI::class.java)
    
    /**
     * Initialize with credentials from BuildConfig
     * Not needed as we're using BuildConfig directly, but kept for compatibility
     */
    fun initialize(url: String, anonKey: String) {
        // Already initialized in object declaration
        Log.d(TAG, "Supabase initialized with URL: $url")
    }

    /**
     * Login with email and password
     * @param email the user's email
     * @param password the user's password
     * @return Result with success or failure
     */
    suspend fun login(email: String, password: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Attempting login for email: $email")
            val response = authApi.login(LoginRequest(email, password))
            
            // Store session data
            currentAccessToken = response.accessToken
            currentUser = response.user
            
            // Check if login was successful
            val success = !currentAccessToken.isNullOrEmpty() && currentUser != null
            
            if (success) {
                Log.d(TAG, "Login successful for user: ${currentUser?.email}")
            } else {
                Log.d(TAG, "Login failed: No valid token or user data received")
            }
            
            Result.success(success)
        } catch (e: Exception) {
            Log.e(TAG, "Login error: ${e.message}", e)
            Result.failure(e)
        }
    }

    /**
     * Check if a user is currently logged in
     * @return true if a user is logged in, false otherwise
     */
    suspend fun isLoggedIn(): Boolean = withContext(Dispatchers.IO) {
        try {
            // Simply check if we have a token and user
            val loggedIn = !currentAccessToken.isNullOrEmpty() && currentUser != null
            Log.d(TAG, "isLoggedIn: $loggedIn")
            loggedIn
        } catch (e: Exception) {
            Log.e(TAG, "Error checking login status: ${e.message}", e)
            false
        }
    }

    /**
     * Get the current user's email
     * @return the current user's email or null if not logged in
     */
    suspend fun getCurrentUserEmail(): String? = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Getting current user email: ${currentUser?.email}")
            currentUser?.email
        } catch (e: Exception) {
            Log.e(TAG, "Error getting user email: ${e.message}", e)
            null
        }
    }

    /**
     * Sign out the current user
     */
    suspend fun signOut(): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            // If there's no token, we're already logged out
            if (currentAccessToken == null) {
                clearSession()
                return@withContext Result.success(true)
            }
            
            // Call logout endpoint
            authApi.logout(authToken = "Bearer $currentAccessToken")
            
            // Clear session data
            clearSession()
            
            Log.d(TAG, "User logged out successfully")
            Result.success(true)
        } catch (e: Exception) {
            // Even if API call fails, clear session data
            clearSession()
            Log.e(TAG, "Error during logout: ${e.message}", e)
            
            // We still return success as the user is effectively logged out locally
            Result.success(true)
        }
    }
    
    /**
     * Clear local session data
     */
    private fun clearSession() {
        currentAccessToken = null
        currentUser = null
    }
} 