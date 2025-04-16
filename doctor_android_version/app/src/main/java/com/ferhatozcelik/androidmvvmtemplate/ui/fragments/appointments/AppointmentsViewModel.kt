package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.appointments

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Appointment
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Patient
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
    
    // Store patient data
    private val _patients = MutableLiveData<Map<String, Patient>>()
    val patients: LiveData<Map<String, Patient>> = _patients
    
    // Cache of patients by ID
    private val patientMap = mutableMapOf<String, Patient>()

    // Store original lists for local filtering
    private var allAppointmentsList: List<Appointment> = emptyList()
    private var scheduledAppointmentsList: List<Appointment> = emptyList()

    // Track which list is currently displayed (0 = scheduled, 1 = all)
    private var currentListMode = 0

    init {
        loadPatients() // Load patients first
        loadScheduledAppointments() // Then load scheduled appointments
    }
    
    fun loadPatients() {
        viewModelScope.launch {
            SupabaseManager.getPatients().fold(
                onSuccess = { patientsList ->
                    // Create a map of patient ID to Patient object
                    patientsList.forEach { patient ->
                        patientMap[patient.id] = patient
                    }
                    _patients.postValue(patientMap)
                    Log.d(TAG, "Successfully loaded ${patientsList.size} patients")
                },
                onFailure = { exception ->
                    Log.e(TAG, "Error loading patients", exception)
                    _error.postValue("Failed to load patients: ${exception.localizedMessage}")
                }
            )
        }
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
                    
                    // Fetch patient data for all appointments
                    fetchPatientsForAppointments(appointmentsList)
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
                    
                    // Fetch patient data for scheduled appointments
                    fetchPatientsForAppointments(appointmentsList)
                },
                onFailure = { exception ->
                    Log.e(TAG, "Error loading scheduled appointments", exception)
                    _error.postValue("Failed to load appointments: ${exception.localizedMessage}")
                    _isLoading.postValue(false)
                }
            )
        }
    }
    
    // Fetch patient data for appointments
    private fun fetchPatientsForAppointments(appointmentsList: List<Appointment>) {
        val patientIds = appointmentsList.map { it.patient_id }.distinct()
        
        // Only fetch data for patients we don't already have
        val missingPatientIds = patientIds.filter { !patientMap.containsKey(it) }
        
        if (missingPatientIds.isNotEmpty()) {
            viewModelScope.launch {
                missingPatientIds.forEach { patientId ->
                    SupabaseManager.getPatient(patientId).fold(
                        onSuccess = { patients -> 
                            if (patients.isNotEmpty()) {
                                patientMap[patientId] = patients.first()
                                _patients.postValue(patientMap)
                            }
                        },
                        onFailure = { exception ->
                            Log.e(TAG, "Error fetching patient $patientId", exception)
                        }
                    )
                }
            }
        }
    }

    // Get patient by ID
    fun getPatient(patientId: String): Patient? {
        return patientMap[patientId]
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