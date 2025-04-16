package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.home

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Appointment
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import com.ferhatozcelik.androidmvvmtemplate.domain.repository.ExampleRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class HomeViewModel(private val exampleRepository: ExampleRepository) : ViewModel() {
    private val TAG = HomeViewModel::class.java.simpleName
    
    private val _patientCount = MutableLiveData<Int>(0)
    val patientCount: LiveData<Int> = _patientCount
    
    private val _todayAppointmentsCount = MutableLiveData<Int>(0)
    val todayAppointmentsCount: LiveData<Int> = _todayAppointmentsCount
    
    private val _isLoading = MutableLiveData<Boolean>(false)
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _error = MutableLiveData<String?>(null)
    val error: LiveData<String?> = _error
    
    init {
        loadPatientCount()
        loadTodayAppointmentsCount()
    }
    
    fun loadPatientCount() {
        _isLoading.value = true
        viewModelScope.launch {
            SupabaseManager.getPatients().fold(
                onSuccess = { patients ->
                    _patientCount.postValue(patients.size)
                    _isLoading.postValue(false)
                    Log.d(TAG, "Successfully loaded ${patients.size} patients")
                },
                onFailure = { exception ->
                    _error.postValue("Failed to load patients: ${exception.localizedMessage}")
                    _isLoading.postValue(false)
                    Log.e(TAG, "Error loading patients", exception)
                }
            )
        }
    }
    
    fun loadTodayAppointmentsCount() {
        _isLoading.value = true
        viewModelScope.launch {
            SupabaseManager.getAppointments().fold(
                onSuccess = { appointments ->
                    // Filter for today's appointments
                    val todayAppointments = filterTodayAppointments(appointments)
                    _todayAppointmentsCount.postValue(todayAppointments.size)
                    _isLoading.postValue(false)
                    Log.d(TAG, "Successfully loaded ${todayAppointments.size} today's appointments out of ${appointments.size} total")
                },
                onFailure = { exception ->
                    _error.postValue("Failed to load appointments: ${exception.localizedMessage}")
                    _isLoading.postValue(false)
                    Log.e(TAG, "Error loading appointments", exception)
                }
            )
        }
    }
    
    private fun filterTodayAppointments(appointments: List<Appointment>): List<Appointment> {
        // Get today's date as yyyy-MM-dd
        val todayDateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val todayDateString = todayDateFormat.format(Date())
        
        // Filter appointments that have the same date as today
        return appointments.filter { appointment ->
            // Get the appointment date as yyyy-MM-dd
            val appointmentDate = appointment.getDate()
            appointmentDate == todayDateString
        }
    }
    
    fun clearError() {
        _error.postValue(null)
    }
    
    fun refresh() {
        loadPatientCount()
        loadTodayAppointmentsCount()
    }
}