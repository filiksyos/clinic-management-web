package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Manages user session information across the app.
 */
object SessionManager {
    private const val TAG = "SessionManager"
    private const val PREF_NAME = "doctor_prefs"
    private const val KEY_IS_LOGGED_IN = "is_logged_in"
    private const val KEY_USER_EMAIL = "user_email"
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
    
    // LiveData for observing login state changes
    private val _loginState = MutableLiveData<Boolean>()
    val loginState: LiveData<Boolean> = _loginState
    
    // LiveData for user email
    private val _userEmail = MutableLiveData<String?>()
    val userEmail: LiveData<String?> = _userEmail
    
    private lateinit var sharedPreferences: SharedPreferences
    
    /**
     * Initialize the SessionManager with application context
     */
    fun init(context: Context) {
        Log.d(TAG, "Initializing SessionManager")
        sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        
        // Load initial values
        val isLoggedIn = sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
        val email = sharedPreferences.getString(KEY_USER_EMAIL, null)
        
        // Set initial values on main thread
        _loginState.value = isLoggedIn
        _userEmail.value = email
        
        Log.d(TAG, "SessionManager initialized with logged in: $isLoggedIn, email: $email")
        
        // Update session data from Supabase if logged in
        if (isLoggedIn) {
            refreshSessionData()
        }
    }
    
    /**
     * Mark user as logged in
     */
    fun setLoggedIn(email: String) {
        Log.d(TAG, "Setting user as logged in: $email")
        sharedPreferences.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, true)
            putString(KEY_USER_EMAIL, email)
            apply()
        }
        
        // Update LiveData on main thread
        _loginState.value = true
        _userEmail.value = email
    }
    
    /**
     * Mark user as logged out
     */
    fun setLoggedOut() {
        Log.d(TAG, "Setting user as logged out")
        sharedPreferences.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, false)
            remove(KEY_USER_EMAIL)
            remove(KEY_ACCESS_TOKEN)
            remove(KEY_REFRESH_TOKEN)
            apply()
        }
        
        // Update LiveData on main thread if called from background
        val mainScope = CoroutineScope(Dispatchers.Main)
        mainScope.launch {
            _loginState.value = false
            _userEmail.value = null
        }
    }
    
    /**
     * Check if user is logged in
     */
    fun isLoggedIn(): Boolean {
        val loggedIn = sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
        Log.d(TAG, "Checking if user is logged in: $loggedIn")
        return loggedIn
    }
    
    /**
     * Save access token
     */
    fun saveAccessToken(token: String) {
        sharedPreferences.edit().putString(KEY_ACCESS_TOKEN, token).apply()
    }
    
    /**
     * Get access token
     */
    fun getAccessToken(): String? {
        return sharedPreferences.getString(KEY_ACCESS_TOKEN, null)
    }
    
    /**
     * Save refresh token
     */
    fun saveRefreshToken(token: String) {
        sharedPreferences.edit().putString(KEY_REFRESH_TOKEN, token).apply()
    }
    
    /**
     * Get refresh token
     */
    fun getRefreshToken(): String? {
        return sharedPreferences.getString(KEY_REFRESH_TOKEN, null)
    }
    
    /**
     * Save both tokens
     */
    fun saveTokens(accessToken: String, refreshToken: String) {
        Log.d(TAG, "Saving tokens")
        sharedPreferences.edit().apply {
            putString(KEY_ACCESS_TOKEN, accessToken)
            putString(KEY_REFRESH_TOKEN, refreshToken)
            apply()
        }
    }
    
    /**
     * Refresh session data from Supabase
     */
    private fun refreshSessionData() {
        Log.d(TAG, "Refreshing session data")
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val isLoggedIn = SupabaseManager.isLoggedIn()
                val email = SupabaseManager.getCurrentUserEmail()
                
                Log.d(TAG, "Session refresh result - logged in: $isLoggedIn, email: $email")
                
                if (isLoggedIn && email != null) {
                    // Update stored email if needed
                    if (_userEmail.value != email) {
                        sharedPreferences.edit().putString(KEY_USER_EMAIL, email).apply()
                        
                        // Switch to main thread to update LiveData
                        withContext(Dispatchers.Main) {
                            _userEmail.value = email
                        }
                    }
                } else if (!isLoggedIn) {
                    // If Supabase says not logged in, update our state
                    // But ensure we do LiveData updates on main thread
                    withContext(Dispatchers.Main) {
                        setLoggedOut()
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error refreshing session data: ${e.message}", e)
                
                // If error checking login status, assume not logged in
                // But ensure we do LiveData updates on main thread
                withContext(Dispatchers.Main) {
                    setLoggedOut()
                }
            }
        }
    }
    
    /**
     * Check if we have a valid access token
     */
    fun hasValidAccessToken(): Boolean {
        val token = getAccessToken()
        Log.d(TAG, "Checking for valid access token: ${!token.isNullOrEmpty()}")
        return !token.isNullOrEmpty()
    }
    
    /**
     * Validate session state and token
     * Returns true if valid session found, false otherwise
     */
    fun validateSession(): Boolean {
        val isLoggedInValue = isLoggedIn()
        val hasToken = hasValidAccessToken()
        
        Log.d(TAG, "Validating session - logged in: $isLoggedInValue, has token: $hasToken")
        
        // If logged in state doesn't match token existence, fix it
        if (isLoggedInValue && !hasToken) {
            Log.w(TAG, "Session inconsistency: Marked as logged in but no token found. Clearing session.")
            setLoggedOut()
            return false
        }
        
        return isLoggedInValue && hasToken
    }
} 