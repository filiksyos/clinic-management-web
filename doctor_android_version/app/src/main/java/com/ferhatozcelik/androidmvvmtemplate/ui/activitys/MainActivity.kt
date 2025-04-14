package com.ferhatozcelik.androidmvvmtemplate.ui.activitys

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SessionManager
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import com.ferhatozcelik.androidmvvmtemplate.databinding.ActivityMainBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseActivity
import kotlinx.coroutines.launch

class MainActivity : BaseActivity<ActivityMainBinding>(ActivityMainBinding::inflate) {
    private val TAG = MainActivity::class.java.simpleName
    private lateinit var navController: NavController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.i(TAG, "onCreate()")

        if (!checkLoginStatus()) {
            // User not logged in, already navigated to login screen
            return
        }

        // User is logged in, set up UI
        try {
            setupNavigation()
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up navigation: ${e.message}", e)
            Toast.makeText(this, "Error setting up navigation", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupNavigation() {
        try {
            // Find NavController
            val navHostFragment = supportFragmentManager
                .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
            navController = navHostFragment.navController

            // Setup BottomNavigationView with NavController
            binding.bottomNavigation.setupWithNavController(navController)
            
            Log.d(TAG, "Navigation setup complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error in setupNavigation: ${e.message}", e)
            throw e // Re-throw to be handled by the calling method
        }
    }
    
    private fun checkLoginStatus(): Boolean {
        if (!SessionManager.isLoggedIn()) {
            Log.d(TAG, "User not logged in, redirecting to login screen")
            // Not logged in, go back to login
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return false
        }
        Log.d(TAG, "User is logged in, email: ${SessionManager.getCurrentUserEmail()}")
        return true
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        try {
            menuInflater.inflate(R.menu.main_menu, menu)
            return true
        } catch (e: Exception) {
            Log.e(TAG, "Error creating options menu: ${e.message}", e)
            return false
        }
    }
    
    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_logout -> {
                performLogout()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
    
    private fun performLogout() {
        Log.d(TAG, "Performing logout")
        lifecycleScope.launch {
            try {
                // Show logout in progress message
                Toast.makeText(this@MainActivity, "Logging out...", Toast.LENGTH_SHORT).show()
                
                // First clear local session state (in case Supabase fails)
                SessionManager.setLoggedOut()
                
                // Then attempt to log out from Supabase
                try {
                    val result = SupabaseManager.signOut()
                    result.fold(
                        onSuccess = { Log.d(TAG, "Supabase logout successful") },
                        onFailure = { Log.e(TAG, "Supabase logout failed: ${it.message}", it) }
                    )
                } catch (e: Exception) {
                    // We already logged out locally, so just log this error
                    Log.e(TAG, "Error during Supabase logout: ${e.message}", e)
                }
                
                // Navigate back to login
                navigateToLogin()
            } catch (e: Exception) {
                Log.e(TAG, "Logout error: ${e.message}", e)
                
                // Make absolutely sure the user is logged out locally
                SessionManager.setLoggedOut()
                
                // Navigate back to login
                navigateToLogin()
            }
        }
    }
    
    private fun navigateToLogin() {
        Log.d(TAG, "Navigating to login screen")
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }

    // Handle navigation errors
    override fun onSupportNavigateUp(): Boolean {
        return try {
            navController.navigateUp() || super.onSupportNavigateUp()
        } catch (e: Exception) {
            Log.e(TAG, "Error in onSupportNavigateUp: ${e.message}", e)
            super.onSupportNavigateUp()
        }
    }
}
