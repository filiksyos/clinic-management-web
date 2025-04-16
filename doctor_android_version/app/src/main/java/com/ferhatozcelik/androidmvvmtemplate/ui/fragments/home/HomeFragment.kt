package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.home

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentHomeBinding
import com.ferhatozcelik.androidmvvmtemplate.domain.repository.ExampleRepository
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment
import org.koin.android.ext.android.inject

class HomeFragment : BaseFragment<FragmentHomeBinding, HomeViewModel>() {
    private val TAG = "HomeFragment"
    
    private val exampleRepository: ExampleRepository by inject()
    override val viewModel by lazy { HomeViewModel(exampleRepository) }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        try {
            // Set welcome message using binding - don't use safe call operator here
            binding.textViewHomeTitle.text = "Welcome to Doctor Dashboard"
            
            // Setup refresh functionality
            setupSwipeRefresh()
            
            // Setup observers to update the UI
            setupObservers()
        } catch (e: Exception) {
            Log.e(TAG, "Error setting home text: ${e.message}")
            // Fallback to findViewById
            view.findViewById<TextView>(R.id.textViewHomeTitle)?.text = "Welcome to Doctor Dashboard"
        }
        
        // Set activity title
        activity?.title = "Home"
    }
    
    private fun setupSwipeRefresh() {
        // Find SwipeRefreshLayout
        val swipeRefreshLayout = view?.findViewById<SwipeRefreshLayout>(R.id.swipeRefreshLayout)
        swipeRefreshLayout?.setOnRefreshListener {
            // Refresh data
            viewModel.refresh()
        }
    }
    
    private fun setupObservers() {
        // Observe patient count
        viewModel.patientCount.observe(viewLifecycleOwner) { count ->
            try {
                // Update patient count text
                val textViewPatientsCount = view?.findViewById<TextView>(R.id.textViewPatientsCount)
                textViewPatientsCount?.text = count.toString()
            } catch (e: Exception) {
                Log.e(TAG, "Error updating patient count: ${e.message}")
            }
        }
        
        // Observe today's appointments count
        viewModel.todayAppointmentsCount.observe(viewLifecycleOwner) { count ->
            try {
                // Update appointments count text
                val textViewAppointmentsCount = view?.findViewById<TextView>(R.id.textViewAppointmentsCount)
                textViewAppointmentsCount?.text = count.toString()
            } catch (e: Exception) {
                Log.e(TAG, "Error updating appointments count: ${e.message}")
            }
        }
        
        // Observe loading state
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            try {
                // Update refresh indicator
                val swipeRefreshLayout = view?.findViewById<SwipeRefreshLayout>(R.id.swipeRefreshLayout)
                swipeRefreshLayout?.isRefreshing = isLoading
                
                // Show/hide progress indicators if needed
                val progressBar = view?.findViewById<View>(R.id.progressBar)
                progressBar?.isVisible = isLoading
            } catch (e: Exception) {
                Log.e(TAG, "Error updating loading state: ${e.message}")
            }
        }
        
        // Observe error messages
        viewModel.error.observe(viewLifecycleOwner) { errorMsg ->
            errorMsg?.let {
                Toast.makeText(requireContext(), it, Toast.LENGTH_SHORT).show()
                viewModel.clearError()
            }
        }
    }
}