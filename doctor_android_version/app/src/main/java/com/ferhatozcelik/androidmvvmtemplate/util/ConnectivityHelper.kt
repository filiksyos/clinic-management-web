package com.ferhatozcelik.androidmvvmtemplate.util

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.provider.Settings

/**
 * Helper class for handling network connectivity interactions
 */
object ConnectivityHelper {
    
    /**
     * Shows a dialog when the app is offline, prompting the user to connect to the internet
     * 
     * @param context The context to show the dialog from
     * @param onRetry Optional callback for when the user clicks "Try Again"
     * @param onCancel Optional callback for when the user dismisses the dialog
     */
    fun showConnectivityDialog(
        context: Context,
        onRetry: (() -> Unit)? = null,
        onCancel: (() -> Unit)? = null
    ) {
        val builder = AlertDialog.Builder(context)
            .setTitle("No Internet Connection")
            .setMessage("This app requires an internet connection to fetch the latest data. Some features may use cached data when offline, but for the best experience, please connect to the internet.")
            .setCancelable(false)
            .setPositiveButton("Connect") { dialog, _ ->
                dialog.dismiss()
                // Open wifi settings
                val intent = Intent(Settings.ACTION_WIFI_SETTINGS)
                context.startActivity(intent)
                
                // Call retry callback after giving time to connect
                onRetry?.invoke()
            }
            .setNegativeButton("Try Again") { dialog, _ ->
                dialog.dismiss()
                
                // Check if we're connected now
                if (NetworkUtil.hasInternetConnection(context)) {
                    onRetry?.invoke()
                } else {
                    // Still not connected, callback anyway to let calling code handle it
                    onRetry?.invoke()
                }
            }
            .setNeutralButton("Continue Anyway") { dialog, _ ->
                dialog.dismiss()
                onCancel?.invoke()
            }
            
        builder.create().show()
    }
    
    /**
     * Checks if the device is connected to the internet and shows a dialog if not
     * 
     * @param context The context to check connectivity from
     * @param onConnected Callback for when the device is connected
     * @return true if connected, false otherwise
     */
    fun checkConnectivityAndPrompt(
        context: Context,
        onConnected: () -> Unit = {}
    ): Boolean {
        val isConnected = NetworkUtil.hasInternetConnection(context)
        
        if (!isConnected) {
            showConnectivityDialog(
                context,
                onRetry = {
                    // Check if we're connected after retry
                    if (NetworkUtil.hasInternetConnection(context)) {
                        onConnected()
                    }
                }
            )
        } else {
            onConnected()
        }
        
        return isConnected
    }
} 