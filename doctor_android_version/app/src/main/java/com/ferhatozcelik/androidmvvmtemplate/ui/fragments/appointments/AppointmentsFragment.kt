package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.appointments

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Appointment
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentAppointmentsBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.adapters.AppointmentsAdapter
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment
import com.google.android.material.tabs.TabLayout

class AppointmentsFragment : BaseFragment<FragmentAppointmentsBinding, AppointmentsViewModel>() {
    private val TAG = "AppointmentsFragment"
    
    override val viewModel: AppointmentsViewModel by lazy {
        ViewModelProvider(this)[AppointmentsViewModel::class.java]
    }
    
    private val appointmentsAdapter by lazy {
        AppointmentsAdapter { appointment ->
            onAppointmentSelected(appointment)
        }
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        setupSwipeRefresh()
        setupTabLayout()
        setupObservers()
        
        // Set activity title
        activity?.title = getString(R.string.appointments)
    }
    
    private fun setupRecyclerView() {
        binding.recyclerViewAppointments.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = appointmentsAdapter
        }
    }
    
    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setOnRefreshListener {
            // Selected tab determines what to refresh
            if (binding.tabLayoutAppointments.selectedTabPosition == 0) {
                viewModel.loadScheduledAppointments()
            } else {
                viewModel.loadAllAppointments()
            }
        }
    }
    
    private fun setupTabLayout() {
        binding.tabLayoutAppointments.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                when (tab?.position) {
                    0 -> viewModel.loadScheduledAppointments()
                    1 -> viewModel.loadAllAppointments()
                }
            }
            
            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            
            override fun onTabReselected(tab: TabLayout.Tab?) {
                // Refresh data on tab reselection
                when (tab?.position) {
                    0 -> viewModel.loadScheduledAppointments()
                    1 -> viewModel.loadAllAppointments()
                }
            }
        })
    }
    
    private fun setupObservers() {
        viewModel.appointments.observe(viewLifecycleOwner) { appointments ->
            Log.d(TAG, "Observed ${appointments.size} appointments")
            appointmentsAdapter.submitList(appointments)
            updateEmptyState(appointments.isEmpty())
        }
        
        viewModel.patients.observe(viewLifecycleOwner) { patientMap ->
            Log.d(TAG, "Observed ${patientMap.size} patients")
            // Update the adapter with patient names for display
            patientMap.forEach { (patientId, patient) ->
                appointmentsAdapter.updatePatientName(patientId, patient.getFullName())
            }
        }
        
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefreshLayout.isRefreshing = isLoading
            binding.progressBar.isVisible = isLoading && appointmentsAdapter.itemCount == 0
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
    
    private fun onAppointmentSelected(appointment: Appointment) {
        Log.d(TAG, "Appointment selected: ${appointment.id}")
        // Get patient from cache
        val patient = viewModel.getPatient(appointment.patient_id)
        val patientName = patient?.getFullName() ?: "Unknown Patient"
        
        // In a real app, navigate to appointment details
        Toast.makeText(
            requireContext(), 
            "Selected appointment with $patientName", 
            Toast.LENGTH_SHORT
        ).show()
    }
} 