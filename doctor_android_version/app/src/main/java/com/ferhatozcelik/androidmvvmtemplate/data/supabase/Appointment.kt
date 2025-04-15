package com.ferhatozcelik.androidmvvmtemplate.data.supabase

import java.text.SimpleDateFormat
import java.util.*

data class Appointment(
    val id: String = "",
    val patient_id: String = "",
    val doctor_id: String = "",
    val date: String = "",
    val time: String = "",
    val status: String = STATUS_SCHEDULED,
    val notes: String? = null,
    val created_at: String? = null,
    val reason: String? = null,
    // Nested patient object from Supabase join
    var patient: Patient? = null
) {
    fun getFormattedDate(): String {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            val parsedDate = inputFormat.parse(date)
            return parsedDate?.let { outputFormat.format(it) } ?: date
        } catch (e: Exception) {
            return date
        }
    }
    
    fun getFormattedTime(): String {
        try {
            val inputFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            val outputFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
            val parsedTime = inputFormat.parse(time)
            return parsedTime?.let { outputFormat.format(it) } ?: time
        } catch (e: Exception) {
            return time
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