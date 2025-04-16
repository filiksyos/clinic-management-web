package com.ferhatozcelik.androidmvvmtemplate.ui.activitys

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SessionManager
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import com.ferhatozcelik.androidmvvmtemplate.databinding.ActivityLoginBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseActivity
import com.ferhatozcelik.androidmvvmtemplate.util.ConnectivityHelper
import com.ferhatozcelik.androidmvvmtemplate.util.NetworkUtil
import kotlinx.coroutines.launch

class LoginActivity : BaseActivity<ActivityLoginBinding>(ActivityLoginBinding::inflate) {

    companion object {
        private const val TAG = "LoginActivity"
        
        // Default doctor credentials
        private const val DOCTOR_EMAIL = "doctornew@clinic.com"
        private const val DOCTOR_PASSWORD = "password123"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(TAG, "onCreate() - Starting LoginActivity")
        
        // Check for network connectivity
        checkConnectivity()

        // Check if already logged in
        if (SessionManager.validateSession()) {
            Log.d(TAG, "Valid session found, navigating to MainActivity")
            navigateToMainActivity()
            return
        } else {
            Log.d(TAG, "No valid session found, showing login screen")
        }

        // Auto-fill the email and password fields
        binding.emailInput.setText(DOCTOR_EMAIL)
        binding.passwordInput.setText(DOCTOR_PASSWORD)

        // Set up the login button click listener
        binding.loginButton.setOnClickListener {
            Log.d(TAG, "Login button clicked")
            if (checkConnectivity()) {
                performLogin()
            }
        }
    }
    
    private fun checkConnectivity(): Boolean {
        if (!NetworkUtil.hasInternetConnection(this)) {
            ConnectivityHelper.showConnectivityDialog(
                context = this,
                onRetry = {
                    // If connection is established after retry, try to log in again
                    if (NetworkUtil.hasInternetConnection(this)) {
                        performLogin()
                    }
                },
                onCancel = {
                    // Allow user to continue without connectivity
                    // If they have a cached session, they might be able to use offline features
                    if (SessionManager.validateSession()) {
                        navigateToMainActivity()
                    } else {
                        Toast.makeText(this, 
                            "You need to connect to the internet to log in for the first time", 
                            Toast.LENGTH_LONG).show()
                    }
                }
            )
            return false
        }
        return true
    }

    private fun performLogin() {
        val email = binding.emailInput.text.toString()
        val password = binding.passwordInput.text.toString()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter both email and password", Toast.LENGTH_SHORT).show()
            return
        }

        // Show loading indicator
        binding.loginProgressBar.visibility = View.VISIBLE
        binding.loginButton.isEnabled = false
        
        Log.d(TAG, "Attempting login with email: $email")

        // Attempt to log in
        lifecycleScope.launch {
            try {
                Log.d(TAG, "Calling SupabaseManager.login()")
                val result = SupabaseManager.login(email, password)
                
                result.fold(
                    onSuccess = { success ->
                        if (success) {
                            Log.d(TAG, "Login successful")
                            // Login successful, update SessionManager and session state
                            SessionManager.setLoggedIn(email)
                            
                            // Double check session validity
                            if (SessionManager.validateSession()) {
                                // Navigate to MainActivity
                                navigateToMainActivity()
                            } else {
                                // Session validation failed, show error
                                Log.e(TAG, "Session validation failed after successful login")
                                Toast.makeText(
                                    this@LoginActivity,
                                    "Session error, please try again",
                                    Toast.LENGTH_SHORT
                                ).show()
                                
                                // Hide loading indicator and re-enable login button
                                binding.loginProgressBar.visibility = View.GONE
                                binding.loginButton.isEnabled = true
                            }
                        } else {
                            Log.d(TAG, "Login returned success=false")
                            // Login failed but no exception - invalid credentials
                            Toast.makeText(
                                this@LoginActivity,
                                "Invalid email or password",
                                Toast.LENGTH_SHORT
                            ).show()
                            
                            // Hide loading indicator and re-enable login button
                            binding.loginProgressBar.visibility = View.GONE
                            binding.loginButton.isEnabled = true
                        }
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Login error: ${error.message}", error)
                        
                        // Check if the error is related to connectivity
                        if (error.message?.contains("Unable to resolve host") == true || 
                            error.message?.contains("Failed to connect") == true) {
                            
                            // It's a network connectivity issue
                            Toast.makeText(
                                this@LoginActivity,
                                "Network error. Please check your internet connection.",
                                Toast.LENGTH_SHORT
                            ).show()
                            
                            // Show connectivity dialog
                            checkConnectivity()
                        } else {
                            // Other login error
                            Toast.makeText(
                                this@LoginActivity,
                                "Login failed: ${error.localizedMessage}",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                        
                        // Hide loading indicator and re-enable login button
                        binding.loginProgressBar.visibility = View.GONE
                        binding.loginButton.isEnabled = true
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error during login: ${e.message}", e)
                // Handle any unexpected exceptions
                Toast.makeText(
                    this@LoginActivity,
                    "Login failed: ${e.localizedMessage}",
                    Toast.LENGTH_SHORT
                ).show()
                
                // Hide loading indicator and re-enable login button
                binding.loginProgressBar.visibility = View.GONE
                binding.loginButton.isEnabled = true
            }
        }
    }

    private fun navigateToMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish() // Close LoginActivity so user can't go back
    }
} 