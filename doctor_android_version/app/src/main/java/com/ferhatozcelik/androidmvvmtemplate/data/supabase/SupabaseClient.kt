package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import android.content.Context
import android.util.Log
import com.ferhatozcelik.androidmvvmtemplate.BuildConfig
import com.ferhatozcelik.androidmvvmtemplate.util.NetworkUtil
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.io.FileNotFoundException
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

// Retrofit interface for Patients API
interface PatientsAPI {
    @GET("rest/v1/patients")
    suspend fun getAllPatients(
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Authorization") authToken: String
    ): List<Patient>
    
    @GET("rest/v1/patients")
    suspend fun getPatient(
        @Query("id") id: String,
        @Query("select") select: String = "*",
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Authorization") authToken: String
    ): List<Patient>
}

// Retrofit interface for Appointments API
interface AppointmentsAPI {
    @GET("rest/v1/appointments")
    suspend fun getAllAppointments(
        @Query("select") select: String = "*",
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Authorization") authToken: String
    ): List<Appointment>
    
    @GET("rest/v1/appointments")
    suspend fun getScheduledAppointments(
        @Query("status") status: String = "eq.scheduled",
        @Query("select") select: String = "*",
        @Query("order") order: String = "appointment_date.asc",
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Authorization") authToken: String
    ): List<Appointment>

    @GET("rest/v1/appointments")
    suspend fun getAppointment(
        @Query("id") id: String = "eq.",
        @Query("select") select: String = "*",
        @Header("apikey") apiKey: String = BuildConfig.SUPABASE_ANON_KEY,
        @Header("Authorization") authToken: String
    ): List<Appointment>
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
    
    // Cache for appointments
    private var cachedAppointments: List<Appointment>? = null
    private const val APPOINTMENTS_CACHE_FILE = "appointments_cache.json"
    private var applicationContext: Context? = null

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
    private val retrofit = Retrofit.Builder()
        .baseUrl(supabaseUrl)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        
    // Create API services
    private val authApi = retrofit.create(SupabaseAuthAPI::class.java)
    private val patientsApi = retrofit.create(PatientsAPI::class.java)
    private val appointmentsApi = retrofit.create(AppointmentsAPI::class.java)
    
    /**
     * Initialize with credentials from BuildConfig
     * Not needed as we're using BuildConfig directly, but kept for compatibility
     */
    fun initialize(url: String, anonKey: String, context: Context) {
        // Already initialized in object declaration
        Log.d(TAG, "Supabase initialized with URL: $url")
        
        applicationContext = context.applicationContext
        
        // Try to restore session from SessionManager
        restoreSession()
        
        // Try to load appointments from cache
        loadAppointmentsFromCache()
    }
    
    /**
     * Restore session from SessionManager if available
     */
    private fun restoreSession() {
        Log.d(TAG, "Attempting to restore session from SessionManager")
        currentAccessToken = SessionManager.getAccessToken()
        
        if (!currentAccessToken.isNullOrEmpty()) {
            // If we have a token, create a minimal user object
            currentUser = SupabaseUser(
                id = null, // We don't store this
                email = SessionManager.userEmail.value
            )
            Log.d(TAG, "Session restored with token and email: ${currentUser?.email}")
        } else {
            Log.d(TAG, "No session found to restore")
        }
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
                
                // Save tokens to SessionManager for persistence
                if (response.accessToken != null && response.refreshToken != null) {
                    SessionManager.saveTokens(response.accessToken, response.refreshToken)
                    Log.d(TAG, "Tokens saved to SessionManager")
                } else {
                    Log.e(TAG, "Missing tokens in login response")
                }
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
            // If we don't have a token in memory, try to restore from SessionManager
            if (currentAccessToken.isNullOrEmpty()) {
                restoreSession()
            }
            
            // Check if we have a token and user
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
     * Get authentication token for API requests
     */
    private fun getAuthHeader(): String {
        return "Bearer $currentAccessToken"
    }
    
    /**
     * Get all patients
     */
    suspend fun getPatients(): Result<List<Patient>> = withContext(Dispatchers.IO) {
        try {
            // Try to restore session if not authenticated
            if (currentAccessToken == null) {
                restoreSession()
                
                // If still not authenticated after restore attempt, return error
                if (currentAccessToken == null) {
                    Log.e(TAG, "Not authenticated. Login required.")
                    return@withContext Result.failure(Exception("Authentication required. Please log in."))
                }
            }
            
            try {
                val patients = patientsApi.getAllPatients(authToken = getAuthHeader())
                Log.d(TAG, "Retrieved ${patients.size} patients")
                return@withContext Result.success(patients)
            } catch (e: Exception) {
                // If we get a 401, try logging in again with stored credentials
                if (e.message?.contains("401") == true) {
                    Log.w(TAG, "Authentication token expired. Attempting to refresh session.")
                    
                    // Clear current token as it's invalid
                    currentAccessToken = null
                    
                    // Try to get an email from session manager
                    val email = SessionManager.userEmail.value
                    
                    if (!email.isNullOrEmpty()) {
                        // We need to redirect user to login screen
                        return@withContext Result.failure(Exception("Session expired. Please log in again."))
                    } else {
                        return@withContext Result.failure(Exception("Authentication required. Please log in."))
                    }
                }
                
                // For other errors, just return the failure
                Log.e(TAG, "Error fetching patients: ${e.message}", e)
                return@withContext Result.failure(e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in getPatients: ${e.message}", e)
            return@withContext Result.failure(e)
        }
    }
    
    /**
     * Get a single patient by ID
     */
    suspend fun getPatient(patientId: String): Result<List<Patient>> = withContext(Dispatchers.IO) {
        try {
            if (currentAccessToken == null) {
                return@withContext Result.failure(Exception("Not authenticated"))
            }
            
            val patients = patientsApi.getPatient(id = "eq.$patientId", authToken = getAuthHeader())
            Log.d(TAG, "Retrieved patient with ID: $patientId")
            Result.success(patients)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching patient with ID $patientId: ${e.message}", e)
            Result.failure(e)
        }
    }
    
    /**
     * Get all appointments
     */
    suspend fun getAppointments(): Result<List<Appointment>> = withContext(Dispatchers.IO) {
        try {
            // If we have an application context, check for network connectivity
            if (applicationContext != null) {
                val isConnected = NetworkUtil.hasInternetConnection(applicationContext!!)
                
                if (!isConnected) {
                    Log.d(TAG, "No internet connection, using cached appointments")
                    cachedAppointments?.let {
                        Log.d(TAG, "Returning ${it.size} cached appointments")
                        return@withContext Result.success(it)
                    } ?: run {
                        Log.e(TAG, "No cached appointments available")
                        return@withContext Result.failure(Exception("No internet connection and no cached data available. Please connect to the internet."))
                    }
                }
            }
            
            // Try to restore session if not authenticated
            if (currentAccessToken == null) {
                restoreSession()
                
                // If still not authenticated after restore attempt, try using cached data
                if (currentAccessToken == null) {
                    Log.e(TAG, "Not authenticated. Checking for cached data.")
                    cachedAppointments?.let {
                        Log.d(TAG, "Returning ${it.size} cached appointments instead of requiring login")
                        return@withContext Result.success(it)
                    } ?: run {
                        Log.e(TAG, "Not authenticated and no cached data available")
                        return@withContext Result.failure(Exception("Authentication required. Please log in."))
                    }
                }
            }
            
            try {
                val appointments = appointmentsApi.getAllAppointments(authToken = getAuthHeader())
                Log.d(TAG, "Retrieved ${appointments.size} appointments")
                
                // Cache the appointments for offline use
                cachedAppointments = appointments
                saveAppointmentsToCache(appointments)
                
                return@withContext Result.success(appointments)
            } catch (e: Exception) {
                // If we get a 401, check for cached data before redirecting
                if (e.message?.contains("401") == true) {
                    Log.w(TAG, "Authentication token expired. Checking for cached data.")
                    
                    // Clear current token as it's invalid
                    currentAccessToken = null
                    
                    // Try to use cached data first
                    cachedAppointments?.let {
                        Log.d(TAG, "Returning ${it.size} cached appointments instead of requiring re-login")
                        return@withContext Result.success(it)
                    }
                    
                    // If no cached data, redirect to login
                    val email = SessionManager.userEmail.value
                    
                    if (!email.isNullOrEmpty()) {
                        return@withContext Result.failure(Exception("Session expired. Please log in again."))
                    } else {
                        return@withContext Result.failure(Exception("Authentication required. Please log in."))
                    }
                }
                
                // For network or other errors, try to use cached data
                Log.e(TAG, "Error fetching appointments: ${e.message}, checking for cached data", e)
                cachedAppointments?.let {
                    Log.d(TAG, "Returning ${it.size} cached appointments due to fetch error")
                    return@withContext Result.success(it)
                }
                
                // If no cached data, return the error
                return@withContext Result.failure(e)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error in getAppointments: ${e.message}, checking for cached data", e)
            
            // Try to use cached data as a last resort
            cachedAppointments?.let {
                Log.d(TAG, "Returning ${it.size} cached appointments as fallback")
                return@withContext Result.success(it)
            }
            
            return@withContext Result.failure(e)
        }
    }
    
    /**
     * Get scheduled appointments
     */
    suspend fun getScheduledAppointments(): Result<List<Appointment>> = withContext(Dispatchers.IO) {
        try {
            // Check for offline mode first
            if (applicationContext != null) {
                val isConnected = NetworkUtil.hasInternetConnection(applicationContext!!)
                
                if (!isConnected) {
                    Log.d(TAG, "No internet connection, filtering cached appointments for scheduled status")
                    cachedAppointments?.let { allAppointments ->
                        val scheduled = allAppointments.filter { it.status == Appointment.STATUS_SCHEDULED }
                        Log.d(TAG, "Returning ${scheduled.size} cached scheduled appointments")
                        return@withContext Result.success(scheduled)
                    } ?: run {
                        Log.e(TAG, "No cached appointments available in offline mode")
                        return@withContext Result.failure(Exception("No internet connection and no cached data available. Please connect to the internet."))
                    }
                }
            }
            
            // If we have a network connection and no token, try to restore
            if (currentAccessToken == null) {
                restoreSession()
                
                // If still not authenticated, try using cached data
                if (currentAccessToken == null) {
                    cachedAppointments?.let { allAppointments ->
                        val scheduled = allAppointments.filter { it.status == Appointment.STATUS_SCHEDULED }
                        Log.d(TAG, "Not authenticated. Returning ${scheduled.size} cached scheduled appointments")
                        return@withContext Result.success(scheduled)
                    } ?: run {
                        return@withContext Result.failure(Exception("Not authenticated"))
                    }
                }
            }
            
            try {
                val appointments = appointmentsApi.getScheduledAppointments(authToken = getAuthHeader())
                Log.d(TAG, "Retrieved ${appointments.size} scheduled appointments")
                return@withContext Result.success(appointments)
            } catch (e: Exception) {
                // First try to use cached data for scheduled appointments
                cachedAppointments?.let { allAppointments ->
                    val scheduled = allAppointments.filter { it.status == Appointment.STATUS_SCHEDULED }
                    Log.d(TAG, "Error fetching scheduled appointments. Using ${scheduled.size} from cache")
                    return@withContext Result.success(scheduled)
                }
                
                // If no cached data, return the error
                Log.e(TAG, "Error fetching scheduled appointments: ${e.message}", e)
                return@withContext Result.failure(e)
            }
        } catch (e: Exception) {
            // Last resort: try cached appointments
            cachedAppointments?.let { allAppointments ->
                val scheduled = allAppointments.filter { it.status == Appointment.STATUS_SCHEDULED }
                Log.d(TAG, "Exception in getScheduledAppointments. Using ${scheduled.size} from cache")
                return@withContext Result.success(scheduled)
            }
            
            Log.e(TAG, "Error in getScheduledAppointments: ${e.message}", e)
            return@withContext Result.failure(e)
        }
    }
    
    /**
     * Save appointments to cache file
     */
    private fun saveAppointmentsToCache(appointments: List<Appointment>) {
        applicationContext?.let { context ->
            try {
                val gson = Gson()
                val json = gson.toJson(appointments)
                context.openFileOutput(APPOINTMENTS_CACHE_FILE, Context.MODE_PRIVATE).use {
                    it.write(json.toByteArray())
                }
                Log.d(TAG, "Saved ${appointments.size} appointments to cache")
            } catch (e: Exception) {
                Log.e(TAG, "Error saving appointments to cache: ${e.message}", e)
            }
        }
    }
    
    /**
     * Load appointments from cache file
     */
    private fun loadAppointmentsFromCache() {
        applicationContext?.let { context ->
            try {
                context.openFileInput(APPOINTMENTS_CACHE_FILE).use { inputStream ->
                    val json = inputStream.bufferedReader().use { it.readText() }
                    val gson = Gson()
                    val type = object : TypeToken<List<Appointment>>() {}.type
                    cachedAppointments = gson.fromJson(json, type)
                    Log.d(TAG, "Loaded ${cachedAppointments?.size ?: 0} appointments from cache")
                }
            } catch (e: FileNotFoundException) {
                Log.d(TAG, "No cache file found for appointments")
                cachedAppointments = null
            } catch (e: Exception) {
                Log.e(TAG, "Error loading appointments from cache: ${e.message}", e)
                cachedAppointments = null
            }
        }
    }
    
    /**
     * Clear local session data
     */
    private fun clearSession() {
        Log.d(TAG, "Clearing session data")
        currentAccessToken = null
        currentUser = null
    }
} 