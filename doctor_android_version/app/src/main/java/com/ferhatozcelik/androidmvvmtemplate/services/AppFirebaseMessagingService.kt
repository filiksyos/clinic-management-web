package com.ferhatozcelik.androidmvvmtemplate.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.data.firebase.FirebaseMessagingManager
import com.ferhatozcelik.androidmvvmtemplate.ui.activitys.MainActivity
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AppFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FCMService"
        const val CHANNEL_ID = "appointments_channel"
        const val CHANNEL_NAME = "Appointments"
        const val CHANNEL_DESCRIPTION = "Notifications for new appointments"
    }

    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    override fun onNewToken(token: String) {
        Log.d(TAG, "Refreshed FCM token: $token")
        // Store the token in SharedPreferences
        saveTokenToPrefs(token)
        // Subscribe to the topic for all doctors
        subscribeToAppointmentsTopic()
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d(TAG, "From: ${remoteMessage.from}")

        // Check if message contains a notification payload
        remoteMessage.notification?.let { notification ->
            Log.d(TAG, "Message Notification Body: ${notification.body}")
            sendNotification(notification.title ?: "New Appointment", notification.body ?: "You have a new appointment")
        }

        // Check if message contains a data payload
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: ${remoteMessage.data}")
            val title = remoteMessage.data["title"] ?: "New Appointment"
            val body = remoteMessage.data["body"] ?: "You have a new appointment"
            val patientName = remoteMessage.data["patientName"] ?: ""
            val appointmentDate = remoteMessage.data["appointmentDate"] ?: ""
            
            val notificationText = if (patientName.isNotEmpty() && appointmentDate.isNotEmpty()) {
                "New appointment with $patientName on $appointmentDate"
            } else {
                body
            }
            
            sendNotification(title, notificationText)
        }
    }

    private fun sendNotification(title: String, messageBody: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("notification_type", "appointment")
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableLights(true)
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(0, notificationBuilder.build())
    }
    
    private fun saveTokenToPrefs(token: String) {
        getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
            .edit()
            .putString("fcm_token", token)
            .apply()
    }
    
    private fun subscribeToAppointmentsTopic() {
        coroutineScope.launch {
            try {
                FirebaseMessagingManager.getInstance().subscribeToNewAppointments()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to subscribe to appointments topic", e)
            }
        }
    }
} 