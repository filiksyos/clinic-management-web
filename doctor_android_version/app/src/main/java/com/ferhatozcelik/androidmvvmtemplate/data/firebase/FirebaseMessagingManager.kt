package com.ferhatozcelik.androidmvvmtemplate.data.firebase

import android.content.Context
import android.util.Log
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

/**
 * Manages Firebase Cloud Messaging operations like token retrieval and topic subscriptions
 */
class FirebaseMessagingManager {

    companion object {
        private const val TAG = "FirebaseMessagingMgr"
        private const val TOPIC_NEW_APPOINTMENTS = "new_appointments"
        
        private var instance: FirebaseMessagingManager? = null
        
        fun getInstance(): FirebaseMessagingManager {
            if (instance == null) {
                instance = FirebaseMessagingManager()
            }
            return instance!!
        }
    }
    
    /**
     * Get the current FCM token or retrieve from SharedPreferences if available
     */
    suspend fun getToken(context: Context): String {
        // First try to get from SharedPreferences for quick access
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val savedToken = prefs.getString("fcm_token", null)
        
        // If we have a token saved, return it
        if (!savedToken.isNullOrEmpty()) {
            return savedToken
        }
        
        // Otherwise, get it from Firebase and save
        return suspendCoroutine { continuation ->
            FirebaseMessaging.getInstance().token
                .addOnSuccessListener { token ->
                    // Save token to SharedPreferences
                    prefs.edit().putString("fcm_token", token).apply()
                    Log.d(TAG, "FCM token: $token")
                    continuation.resume(token)
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Failed to get FCM token", e)
                    continuation.resumeWithException(e)
                }
        }
    }
    
    /**
     * Subscribe to the new appointments topic
     */
    suspend fun subscribeToNewAppointments() {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(TOPIC_NEW_APPOINTMENTS).await()
            Log.d(TAG, "Subscribed to topic: $TOPIC_NEW_APPOINTMENTS")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to subscribe to topic: $TOPIC_NEW_APPOINTMENTS", e)
            throw e
        }
    }
    
    /**
     * Unsubscribe from the new appointments topic
     */
    suspend fun unsubscribeFromNewAppointments() {
        try {
            FirebaseMessaging.getInstance().unsubscribeFromTopic(TOPIC_NEW_APPOINTMENTS).await()
            Log.d(TAG, "Unsubscribed from topic: $TOPIC_NEW_APPOINTMENTS")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to unsubscribe from topic: $TOPIC_NEW_APPOINTMENTS", e)
            throw e
        }
    }
} 