package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import android.util.Log
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Singleton class to manage the Supabase client and authentication.
 */
object SupabaseManager {
    private const val TAG = "SupabaseManager"
    
    // These will be initialized in the App class
    lateinit var supabaseUrl: String
    lateinit var supabaseAnonKey: String
    
    private var _client: SupabaseClient? = null
    
    /**
     * Initialize with credentials
     */
    fun initialize(url: String, anonKey: String) {
        supabaseUrl = url
        supabaseAnonKey = anonKey
        Log.d(TAG, "Initializing Supabase with URL: $url")
        
        try {
            _client = createSupabaseClient(
                supabaseUrl = url,
                supabaseKey = anonKey
            ) {
                // Only install modules that we're certain exist in our version
                install(Postgrest)
                // We'll handle auth separately
            }
            Log.d(TAG, "Supabase client created successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error creating Supabase client: ${e.message}", e)
            throw e
        }
    }
    
    /**
     * Get the client (for direct access if needed)
     */
    fun getClient(): SupabaseClient {
        if (_client == null) {
            Log.e(TAG, "Attempting to access Supabase client before initialization")
            throw IllegalStateException("SupabaseManager not initialized. Call initialize() first.")
        }
        return _client!!
    }
    
    /**
     * Login with email and password
     * @param email the user's email
     * @param password the user's password
     * @return true if login successful, false otherwise
     */
    suspend fun login(email: String, password: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Attempting login for: $email")
            // For now, just simulate a successful login
            // We'll implement actual Supabase auth separately
            
            // Return success - this will be managed by SessionManager
            Result.success(true)
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
        // For now, defer to SessionManager
        true
    }
    
    /**
     * Get the current user's email
     * @return the current user's email or null if not logged in
     */
    suspend fun getCurrentUserEmail(): String? = withContext(Dispatchers.IO) {
        // For now, return null
        null
    }
    
    /**
     * Sign out the current user
     */
    suspend fun signOut(): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Signing out user")
            // For now, just return success
            // We'll implement actual Supabase auth separately
            Result.success(true)
        } catch (e: Exception) {
            Log.e(TAG, "Signout error: ${e.message}", e)
            Result.failure(e)
        }
    }
} 