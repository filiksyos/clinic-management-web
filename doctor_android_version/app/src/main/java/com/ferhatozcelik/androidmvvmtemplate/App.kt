package com.ferhatozcelik.androidmvvmtemplate

import android.app.Application
import android.util.Log
import android.widget.Toast
import com.ferhatozcelik.androidmvvmtemplate.BuildConfig
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SessionManager
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import com.ferhatozcelik.androidmvvmtemplate.di.apiModule
import com.ferhatozcelik.androidmvvmtemplate.di.appModule
import com.ferhatozcelik.androidmvvmtemplate.di.databaseModule
import com.ferhatozcelik.androidmvvmtemplate.di.preferencesModule
import com.ferhatozcelik.androidmvvmtemplate.di.repositoryModule
import com.ferhatozcelik.androidmvvmtemplate.di.sessionModule
import com.ferhatozcelik.androidmvvmtemplate.di.viewModelModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class App : Application() {
    
    companion object {
        private const val TAG = "DoctorApp"
    }
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SessionManager first (doesn't depend on Supabase)
        try {
            SessionManager.init(this)
            Log.d(TAG, "SessionManager initialized successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing SessionManager: ${e.message}", e)
            // Allow app to continue even if SessionManager init fails
        }
        
        // Initialize Koin for dependency injection
        try {
            startKoin {
                androidLogger(Level.ERROR)
                androidContext(this@App)
                modules(
                    listOf(
                        appModule,
                        apiModule,
                        databaseModule,
                        preferencesModule,
                        repositoryModule,
                        sessionModule,
                        viewModelModule
                    )
                )
            }
            Log.d(TAG, "Koin initialized successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Koin: ${e.message}", e)
        }
        
        // Initialize Supabase last (most likely to fail)
        initializeSupabase()
    }
    
    private fun initializeSupabase() {
        try {
            Log.d(TAG, "Initializing Supabase")
            
            val supabaseUrl = BuildConfig.SUPABASE_URL
            val supabaseKey = BuildConfig.SUPABASE_ANON_KEY
            
            if (supabaseUrl.isBlank() || supabaseKey.isBlank()) {
                Log.e(TAG, "Invalid Supabase credentials: URL or key is empty")
                return
            }
            
            SupabaseManager.initialize(
                url = supabaseUrl,
                anonKey = supabaseKey
            )
            Log.d(TAG, "Supabase initialized successfully")
        } catch (e: Throwable) {
            // Catch Throwable instead of Exception to also catch NoClassDefFoundError
            Log.e(TAG, "Error initializing Supabase: ${e::class.java.simpleName} - ${e.message}", e)
            
            // Show a toast for debugging in dev builds
            if (BuildConfig.DEBUG) {
                Toast.makeText(
                    this,
                    "Error initializing Supabase: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}