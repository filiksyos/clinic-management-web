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
    // Parse the date from string with fallback
    private fun parseDate(): Date? {
        return try {
            // Try multiple common formats
            val formats = arrayOf(
                "yyyy-MM-dd'T'HH:mm:ss'+'SS", // ISO with timezone offset
                "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // ISO with Z
                "yyyy-MM-dd HH:mm:ss", // Simple format
                "yyyy-MM-dd HH:mm:ssX" // With timezone
            )
            
            for (format in formats) {
                try {
                    val parser = SimpleDateFormat(format, Locale.getDefault())
                    parser.parse(appointment_date)?.let { return it }
                } catch (e: Exception) {
                    // Try next format
                }
            }
            
            // If none worked, try a more lenient parser
            val parser = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            parser.parse(appointment_date)
            
        } catch (e: Exception) {
            null
        }
    }
    
    // Extract date from timestamp
    fun getDate(): String {
        return parseDate()?.let { date ->
            SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date)
        } ?: appointment_date
    }

    // Extract time from timestamp
    fun getTime(): String {
        return parseDate()?.let { date ->
            SimpleDateFormat("HH:mm", Locale.getDefault()).format(date)
        } ?: ""
    }
    
    fun getFormattedDate(): String {
        return parseDate()?.let { date ->
            SimpleDateFormat("MMM d", Locale.getDefault()).format(date)
        } ?: "Date Unknown"
    }
    
    fun getFormattedTime(): String {
        return parseDate()?.let { date ->
            SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)
        } ?: "Time Unknown"
    }
    
    fun getFormattedDateTime(): String {
        return "${getFormattedDate()} ${getFormattedTime()}"
    }
    
    companion object {
        const val STATUS_SCHEDULED = "scheduled"
        const val STATUS_CONFIRMED = "confirmed"
        const val STATUS_COMPLETED = "completed"
        const val STATUS_CANCELLED = "cancelled"
        const val STATUS_NO_SHOW = "no_show"
    }
} 