package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Manages user session information across the app.
 */
object SessionManager {
    private const val TAG = "SessionManager"
    private const val PREF_NAME = "doctor_prefs"
    private const val KEY_IS_LOGGED_IN = "is_logged_in"
    private const val KEY_USER_EMAIL = "user_email"
    
    // LiveData for observing login state changes
    private val _loginState = MutableLiveData<Boolean>()
    val loginState: LiveData<Boolean> = _loginState
    
    // LiveData for user email
    private val _userEmail = MutableLiveData<String?>()
    val userEmail: LiveData<String?> = _userEmail
    
    private lateinit var sharedPreferences: SharedPreferences
    private var isInitialized = false
    
    /**
     * Initialize the SessionManager with application context
     */
    fun init(context: Context) {
        try {
            Log.d(TAG, "Initializing SessionManager")
            sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            
            // Load initial values
            _loginState.value = sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
            _userEmail.value = sharedPreferences.getString(KEY_USER_EMAIL, null)
            
            isInitialized = true
            Log.d(TAG, "SessionManager initialized, logged in: ${_loginState.value}, email: ${_userEmail.value}")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing SessionManager: ${e.message}", e)
            // Initialize with default values to prevent crashes
            _loginState.value = false
            _userEmail.value = null
        }
    }
    
    /**
     * Mark user as logged in
     */
    fun setLoggedIn(email: String) {
        try {
            Log.d(TAG, "Setting user as logged in: $email")
            ensureInitialized()
            
            sharedPreferences.edit().apply {
                putBoolean(KEY_IS_LOGGED_IN, true)
                putString(KEY_USER_EMAIL, email)
                apply()
            }
            
            _loginState.value = true
            _userEmail.value = email
        } catch (e: Exception) {
            Log.e(TAG, "Error setting logged in: ${e.message}", e)
        }
    }
    
    /**
     * Mark user as logged out
     */
    fun setLoggedOut() {
        try {
            Log.d(TAG, "Setting user as logged out")
            ensureInitialized()
            
            sharedPreferences.edit().apply {
                putBoolean(KEY_IS_LOGGED_IN, false)
                remove(KEY_USER_EMAIL)
                apply()
            }
            
            _loginState.value = false
            _userEmail.value = null
        } catch (e: Exception) {
            Log.e(TAG, "Error setting logged out: ${e.message}", e)
            // Still try to update the LiveData values in case of SharedPreferences error
            _loginState.value = false
            _userEmail.value = null
        }
    }
    
    /**
     * Check if user is logged in
     */
    fun isLoggedIn(): Boolean {
        try {
            ensureInitialized()
            return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking logged in state: ${e.message}", e)
            return false
        }
    }
    
    /**
     * Get current user's email
     */
    fun getCurrentUserEmail(): String? {
        try {
            ensureInitialized()
            return sharedPreferences.getString(KEY_USER_EMAIL, null)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting user email: ${e.message}", e)
            return null
        }
    }
    
    /**
     * Ensures that SessionManager is initialized before use
     */
    private fun ensureInitialized() {
        if (!isInitialized || !::sharedPreferences.isInitialized) {
            Log.e(TAG, "SessionManager used before initialization")
            throw IllegalStateException("SessionManager not initialized. Call init() first.")
        }
    }
} 