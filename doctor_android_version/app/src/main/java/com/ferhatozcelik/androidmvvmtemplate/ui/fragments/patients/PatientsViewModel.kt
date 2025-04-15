package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.patients

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Patient
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.SupabaseManager
import kotlinx.coroutines.launch

class PatientsViewModel(application: Application) : AndroidViewModel(application) {
    private val TAG = "PatientsViewModel"
    
    // LiveData for patients list
    private val _patients = MutableLiveData<List<Patient>>()
    val patients: LiveData<List<Patient>> = _patients
    
    // LiveData for loading state
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    // LiveData for error messages
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error
    
    // Keep track of the original list for reference
    private var allPatients: List<Patient> = emptyList()
    
    // Initialize by loading patients
    init {
        loadPatients()
    }
    
    /**
     * Load patients from Supabase
     */
    fun loadPatients() {
        _isLoading.postValue(true)
        viewModelScope.launch {
            SupabaseManager.getPatients().fold(
                onSuccess = { patientsList ->
                    allPatients = patientsList // Store the full list
                    _patients.postValue(patientsList)
                    _isLoading.postValue(false)
                    Log.d(TAG, "Successfully loaded ${patientsList.size} patients")
                },
                onFailure = { exception ->
                    Log.e(TAG, "Error loading patients", exception)
                    _error.postValue("Failed to load patients: ${exception.localizedMessage}")
                    _isLoading.postValue(false)
                }
            )
        }
    }
    
    /**
     * Get a patient by ID
     */
    fun getPatientById(patientId: String): Patient? {
        return allPatients.find { it.id == patientId }
    }
    
    /**
     * Clear any error
     */
    fun clearError() {
        _error.postValue(null)
    }
} 