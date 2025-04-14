package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import android.content.Context
import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Manages user session information across the app.
 */
object SessionManager {
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
    
    /**
     * Initialize the SessionManager with application context
     */
    fun init(context: Context) {
        sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        
        // Load initial values
        _loginState.value = sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
        _userEmail.value = sharedPreferences.getString(KEY_USER_EMAIL, null)
        
        // Update session data from Supabase if logged in
        if (_loginState.value == true) {
            refreshSessionData()
        }
    }
    
    /**
     * Mark user as logged in
     */
    fun setLoggedIn(email: String) {
        sharedPreferences.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, true)
            putString(KEY_USER_EMAIL, email)
            apply()
        }
        
        _loginState.value = true
        _userEmail.value = email
    }
    
    /**
     * Mark user as logged out
     */
    fun setLoggedOut() {
        sharedPreferences.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, false)
            remove(KEY_USER_EMAIL)
            apply()
        }
        
        _loginState.value = false
        _userEmail.value = null
    }
    
    /**
     * Check if user is logged in
     */
    fun isLoggedIn(): Boolean {
        return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
    }
    
    /**
     * Refresh session data from Supabase
     */
    private fun refreshSessionData() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val isLoggedIn = SupabaseManager.isLoggedIn()
                val email = SupabaseManager.getCurrentUserEmail()
                
                if (isLoggedIn && email != null) {
                    // Update stored email if needed
                    if (_userEmail.value != email) {
                        sharedPreferences.edit().putString(KEY_USER_EMAIL, email).apply()
                        _userEmail.postValue(email)
                    }
                } else if (!isLoggedIn) {
                    // If Supabase says not logged in, update our state
                    setLoggedOut()
                }
            } catch (e: Exception) {
                // If error checking login status, assume not logged in
                setLoggedOut()
            }
        }
    }
} 