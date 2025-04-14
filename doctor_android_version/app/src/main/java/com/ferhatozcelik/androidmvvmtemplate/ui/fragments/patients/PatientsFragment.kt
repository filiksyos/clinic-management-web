package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.patients

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentPatientsBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment

// Simple ViewModel for Patients
class PatientsViewModel : ViewModel() {
    // Add LiveData or StateFlow for patient list, search query, etc.
}

class PatientsFragment : BaseFragment<FragmentPatientsBinding, PatientsViewModel>() {

    // Create the ViewModel using standard ViewModelProvider
    override val viewModel: PatientsViewModel by lazy {
        ViewModelProvider(this)[PatientsViewModel::class.java]
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        try {
            // Use a safe way to access views - first try to use the binding
            binding.textViewPatientsTitle.text = "Patients List"
        } catch (e: Exception) {
            // Fallback to findViewById if binding fails
            view.findViewById<TextView>(R.id.textViewPatientsTitle)?.text = "Patients List"
        }
        
        // Log that the fragment was created successfully
        activity?.title = "Patients"
    }
} 