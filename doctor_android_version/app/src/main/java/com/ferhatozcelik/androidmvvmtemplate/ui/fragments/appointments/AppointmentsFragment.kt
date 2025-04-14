package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.appointments

import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentAppointmentsBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment

// TODO: Create this ViewModel class
class AppointmentsViewModel : ViewModel() {
    // Add LiveData or StateFlow for appointment list, etc.
}

class AppointmentsFragment : BaseFragment<FragmentAppointmentsBinding, AppointmentsViewModel>() {

    override val viewModel: AppointmentsViewModel by lazy {
        ViewModelProvider(this)[AppointmentsViewModel::class.java]
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        try {
            // Use a safe way to access views - first try to use the binding
            binding.textViewAppointmentsTitle.text = "Appointments"
        } catch (e: Exception) {
            // Fallback to findViewById if binding fails
            view.findViewById<TextView>(R.id.textViewAppointmentsTitle)?.text = "Appointments"
        }
        
        // Log that the fragment was created successfully
        activity?.title = "Appointments"

        // TODO: Set up "View Upcoming" button click listener
        // binding.buttonViewUpcoming.setOnClickListener { ... navigate ... }

        // TODO: Initialize RecyclerView Adapter
        // TODO: Observe ViewModel for appointment data
    }

} 