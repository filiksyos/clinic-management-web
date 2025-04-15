package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.appointments

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Appointment
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import kotlinx.coroutines.launch

class AppointmentsViewModel(application: Application) : AndroidViewModel(application) {
    private val TAG = "AppointmentsViewModel"

    private val _appointments = MutableLiveData<List<Appointment>>()
    val appointments: LiveData<List<Appointment>> = _appointments

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    // Store original lists for local filtering
    private var allAppointmentsList: List<Appointment> = emptyList()
    private var scheduledAppointmentsList: List<Appointment> = emptyList()

    // Track which list is currently displayed (0 = scheduled, 1 = all)
    private var currentListMode = 0

    init {
        loadScheduledAppointments() // Load scheduled by default
    }

    fun loadAllAppointments() {
        currentListMode = 1
        _isLoading.postValue(true)
        viewModelScope.launch {
            SupabaseManager.getAppointments().fold(
                onSuccess = { appointmentsList ->
                    allAppointmentsList = appointmentsList // Store full list
                    _appointments.postValue(appointmentsList)
                    _isLoading.postValue(false)
                    Log.d(TAG, "Successfully loaded ${appointmentsList.size} appointments")
                },
                onFailure = { exception ->
                    Log.e(TAG, "Error loading all appointments", exception)
                    _error.postValue("Failed to load appointments: ${exception.localizedMessage}")
                    _isLoading.postValue(false)
                }
            )
        }
    }

    fun loadScheduledAppointments() {
        currentListMode = 0
        _isLoading.postValue(true)
        viewModelScope.launch {
            SupabaseManager.getScheduledAppointments().fold(
                onSuccess = { appointmentsList ->
                    scheduledAppointmentsList = appointmentsList // Store scheduled list
                    // Update the main list only if scheduled is the current view
                    if (currentListMode == 0) {
                        _appointments.postValue(appointmentsList)
                    }
                    _isLoading.postValue(false)
                    Log.d(TAG, "Successfully loaded ${appointmentsList.size} scheduled appointments")
                },
                onFailure = { exception ->
                    Log.e(TAG, "Error loading scheduled appointments", exception)
                    _error.postValue("Failed to load appointments: ${exception.localizedMessage}")
                    _isLoading.postValue(false)
                }
            )
        }
    }

    // Local filtering implementation
    fun filterAppointmentsByPatientName(query: String) {
        val listToFilter = if (currentListMode == 0) {
            scheduledAppointmentsList // Filter scheduled if that tab is active
        } else {
            allAppointmentsList // Filter all if that tab is active
        }

        if (query.isBlank()) {
            _appointments.postValue(listToFilter) // Show the full list for the current tab
            return
        }

        val filtered = listToFilter.filter { appointment ->
            appointment.patient?.getFullName()?.contains(query, ignoreCase = true) == true
        }
        _appointments.postValue(filtered)
    }

    fun getAppointmentById(appointmentId: String): Appointment? {
        // Search in the currently relevant list primarily
        return if (currentListMode == 0) {
            scheduledAppointmentsList.find { it.id == appointmentId } ?: allAppointmentsList.find { it.id == appointmentId }
        } else {
            allAppointmentsList.find { it.id == appointmentId } ?: scheduledAppointmentsList.find { it.id == appointmentId }
        }
    }

    fun clearError() {
        _error.postValue(null)
    }
} 