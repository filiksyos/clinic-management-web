package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.patients

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Patient
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentPatientsBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.adapters.PatientsAdapter
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment
import com.ferhatozcelik.androidmvvmtemplate.ui.fragments.patients.PatientsViewModel

// Remove this placeholder ViewModel definition
/*
class PatientsViewModel : ViewModel() {
    // Add LiveData or StateFlow for patient list, search query, etc.
}
*/

class PatientsFragment : BaseFragment<FragmentPatientsBinding, PatientsViewModel>() {
    private val TAG = "PatientsFragment"
    
    override val viewModel: PatientsViewModel by lazy {
        ViewModelProvider(this).get(PatientsViewModel::class.java)
    }
    
    private val patientsAdapter by lazy {
        PatientsAdapter { patient ->
            onPatientSelected(patient)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        setupSwipeRefresh()
        setupObservers()
        
        // Set activity title
        activity?.title = getString(R.string.patients)
        
        // Load patients initially
        viewModel.loadPatients()
    }
    
    private fun setupRecyclerView() {
        binding.recyclerViewPatients.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = patientsAdapter
        }
    }
    
    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            viewModel.loadPatients()
        }
    }
    
    private fun setupObservers() {
        viewModel.patients.observe(viewLifecycleOwner) { patients ->
            Log.d(TAG, "Observed ${patients.size} patients")
            patientsAdapter.submitList(patients)
            updateEmptyState(patients.isEmpty())
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefreshLayout.isRefreshing = isLoading
            binding.progressBar.isVisible = isLoading && patientsAdapter.itemCount == 0
        }
        
        viewModel.error.observe(viewLifecycleOwner) { errorMessage ->
            errorMessage?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                viewModel.clearError()
            }
        }
    }
    
    private fun updateEmptyState(isEmpty: Boolean) {
        binding.emptyStateLayout.isVisible = isEmpty && !binding.swipeRefreshLayout.isRefreshing
    }
    
    private fun onPatientSelected(patient: Patient) {
        Log.d(TAG, "Patient selected: ${patient.getFullName()}")
        Toast.makeText(
            requireContext(), 
            "Selected patient: ${patient.getFullName()}", 
            Toast.LENGTH_SHORT
        ).show()
    }
} 