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

        setupNavigation()
        checkLoginStatus()
    }

    private fun setupNavigation() {
        // Find NavController
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        navController = navHostFragment.navController

        // Setup BottomNavigationView with NavController
        binding.bottomNavigation.setupWithNavController(navController)
    }
    
    private fun checkLoginStatus() {
        if (!SessionManager.isLoggedIn()) {
            // Not logged in, go back to login
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
    
    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        menuInflater.inflate(R.menu.main_menu, menu)
        return true
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
        lifecycleScope.launch {
            try {
                // Show logout in progress message
                Toast.makeText(this@MainActivity, "Logging out...", Toast.LENGTH_SHORT).show()
                
                // Attempt to log out from Supabase
                val result = SupabaseManager.signOut()
                
                // Always update local session state regardless of Supabase result
                SessionManager.setLoggedOut()
                
                // Navigate back to login
                val intent = Intent(this@MainActivity, LoginActivity::class.java)
                startActivity(intent)
                finish()
            } catch (e: Exception) {
                Log.e(TAG, "Logout error: ${e.message}", e)
                
                // Even if Supabase logout fails, clear local session
                SessionManager.setLoggedOut()
                
                // Navigate back to login
                val intent = Intent(this@MainActivity, LoginActivity::class.java)
                startActivity(intent)
                finish()
            }
        }
    }

    // Optional: Handle Up navigation if you add an ActionBar
    // override fun onSupportNavigateUp(): Boolean {
    //     return navController.navigateUp() || super.onSupportNavigateUp()
    // }
}
