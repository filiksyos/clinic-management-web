package com.ferhatozcelik.androidmvvmtemplate.data.supabase

data class Patient(
    val id: String = "",
    val first_name: String = "",
    val last_name: String = "",
    val email: String = "",
    val phone: String = "",
    val gender: String = "",
    val date_of_birth: String? = null,
    val address: String? = null,
    val created_at: String? = null,
    val medical_history: String? = null
) {
    fun getFullName(): String {
        return "$first_name $last_name"
    }
    
    fun getGenderAndAge(): String {
        val age = date_of_birth?.let {
            try {
                // Simple age calculation for display purposes
                val birthYear = it.split("-")[0].toInt()
                val currentYear = java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)
                currentYear - birthYear
            } catch (e: Exception) {
                null
            }
        }
        
        return if (age != null) {
            "$gender, $age years"
        } else {
            gender
        }
    }
} 