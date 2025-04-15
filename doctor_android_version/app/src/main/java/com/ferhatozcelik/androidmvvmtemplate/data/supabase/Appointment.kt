package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import java.text.SimpleDateFormat
import java.util.*

data class Appointment(
    val id: String = "",
    val patient_id: String = "",
    val doctor_id: String = "", // Keep for compatibility though it's not in DB yet
    val appointment_date: String = "",
    val status: String = STATUS_SCHEDULED,
    val notes: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null,
    val reason: String? = null // Not in DB yet, keeping for future compatibility
) {
    // Extract date from timestamp
    fun getDate(): String {
        try {
            // Parse from ISO format (assuming format like "2025-04-10 03:00:00+00")
            val inputFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ssX", Locale.getDefault())
            val parsedDate = inputFormat.parse(appointment_date)
            return SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(parsedDate!!)
        } catch (e: Exception) {
            return appointment_date
        }
    }

    // Extract time from timestamp
    fun getTime(): String {
        try {
            // Parse from ISO format
            val inputFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ssX", Locale.getDefault())
            val parsedDate = inputFormat.parse(appointment_date)
            return SimpleDateFormat("HH:mm", Locale.getDefault()).format(parsedDate!!)
        } catch (e: Exception) {
            return ""
        }
    }
    
    fun getFormattedDate(): String {
        try {
            // Parse from ISO format
            val inputFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ssX", Locale.getDefault())
            val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            val parsedDate = inputFormat.parse(appointment_date)
            return parsedDate?.let { outputFormat.format(it) } ?: appointment_date
        } catch (e: Exception) {
            return appointment_date
        }
    }
    
    fun getFormattedTime(): String {
        try {
            // Parse from ISO format
            val inputFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ssX", Locale.getDefault())
            val outputFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
            val parsedDate = inputFormat.parse(appointment_date)
            return parsedDate?.let { outputFormat.format(it) } ?: ""
        } catch (e: Exception) {
            return ""
        }
    }
    
    fun getFormattedDateTime(): String {
        return "${getFormattedDate()} at ${getFormattedTime()}"
    }
    
    companion object {
        const val STATUS_SCHEDULED = "scheduled"
        const val STATUS_CONFIRMED = "confirmed"
        const val STATUS_COMPLETED = "completed"
        const val STATUS_CANCELLED = "cancelled"
        const val STATUS_NO_SHOW = "no_show"
    }
} 