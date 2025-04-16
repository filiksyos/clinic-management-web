package com.ferhatozcelik.androidmvvmtemplate

import android.app.Application
import android.util.Log
import com.ferhatozcelik.androidmvvmtemplate.data.firebase.FirebaseMessagingManager
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SessionManager
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import com.ferhatozcelik.androidmvvmtemplate.di.apiModule
import com.ferhatozcelik.androidmvvmtemplate.di.appModule
import com.ferhatozcelik.androidmvvmtemplate.di.databaseModule
import com.ferhatozcelik.androidmvvmtemplate.di.firebaseModule
import com.ferhatozcelik.androidmvvmtemplate.di.preferencesModule
import com.ferhatozcelik.androidmvvmtemplate.di.repositoryModule
import com.ferhatozcelik.androidmvvmtemplate.di.sessionModule
import com.ferhatozcelik.androidmvvmtemplate.di.viewModelModule
import com.google.firebase.FirebaseApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class App : Application() {
    
    companion object {
        private const val TAG = "App"
    }
    
    private val applicationScope = CoroutineScope(Dispatchers.IO)
    
    override fun onCreate() {
        super.onCreate()
        
        try {
            Log.d(TAG, "Initializing app and dependencies")
            
            // Initialize Firebase
            FirebaseApp.initializeApp(this)
            Log.d(TAG, "Firebase initialized")
            
            // Initialize SessionManager first
            SessionManager.init(this)
            Log.d(TAG, "SessionManager initialized")
            
            // Validate session state
            val isSessionValid = SessionManager.validateSession()
            Log.d(TAG, "Session validation result: $isSessionValid")
            
            // Explicitly initialize SupabaseManager with URL and key from BuildConfig
            SupabaseManager.initialize(SupabaseManager.supabaseUrl, SupabaseManager.supabaseAnonKey, this)
            Log.d(TAG, "SupabaseManager initialized with URL: ${SupabaseManager.supabaseUrl}")
            
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
                        viewModelModule,
                        firebaseModule
                    )
                )
            }
            
            // Subscribe to FCM topic for appointments
            applicationScope.launch {
                try {
                    FirebaseMessagingManager.getInstance().subscribeToNewAppointments()
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to subscribe to appointments topic", e)
                }
            }
            
            Log.d(TAG, "App initialization complete")
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing app: ${e.message}", e)
        }
    }
}