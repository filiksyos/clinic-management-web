package com.ferhatozcelik.androidmvvmtemplate.util

import android.content.Context
import android.net.ConnectivityManager
import android.net.ConnectivityManager.NetworkCallback
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

object NetworkUtil {
    private const val TAG = "NetworkUtil"
    private const val PING_TIMEOUT_MS = 2000
    
    /**
     * Checks if the device has an active network connection (WiFi or cellular)
     * This does not guarantee internet connectivity, just that a network interface is available
     */
    fun hasInternetConnection(context: Context): Boolean {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.M) {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val builder = NetworkRequest.Builder()
            builder.addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            builder.addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            builder.addTransportType(NetworkCapabilities.TRANSPORT_CELLULAR)
            val request = builder.build()
            val networkCallback = CustomNetworkCallback()
            connectivityManager.registerNetworkCallback(request, networkCallback)
            return networkCallback.isConnected
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val capabilities = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
            if (capabilities != null && (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR))) {
                return true
            }
        }
        return false
    }
    
    /**
     * Checks if the device has actual internet connectivity by making a lightweight HTTP request
     * Use this for a more reliable check, but be aware it makes a network request
     * 
     * @param context Android context
     * @return true if internet is reachable, false otherwise
     */
    suspend fun hasActualInternetConnectivity(context: Context): Boolean = withContext(Dispatchers.IO) {
        // First check if we have a network connection at all
        if (!hasInternetConnection(context)) {
            return@withContext false
        }
        
        try {
            // Try to make a connection to a reliable server
            val url = URL("https://8.8.8.8") // Google DNS server, lightweight to ping
            val connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = PING_TIMEOUT_MS
            connection.readTimeout = PING_TIMEOUT_MS
            connection.instanceFollowRedirects = false
            connection.useCaches = false
            connection.connect()
            
            val responseCode = connection.responseCode
            Log.d(TAG, "Internet connectivity check response code: $responseCode")
            
            // Any response means we have connectivity
            return@withContext true
        } catch (e: IOException) {
            Log.d(TAG, "No internet connectivity: ${e.message}")
            return@withContext false
        }
    }

    private class CustomNetworkCallback : NetworkCallback() {
        var isConnected = false
            private set

        override fun onAvailable(network: Network) {
            isConnected = true
        }

        override fun onLost(network: Network) {
            isConnected = false
        }
    }
}