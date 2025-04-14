package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.patients

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentPatientsBinding
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment

// TODO: Create this ViewModel class
class PatientsViewModel : ViewModel() {
    // Add LiveData or StateFlow for patient list, search query, etc.
}

// Provide both ViewBinding and ViewModel types to BaseFragment
class PatientsFragment : BaseFragment<FragmentPatientsBinding, PatientsViewModel>() {

    // Inject or provide the ViewModel
    override val viewModel: PatientsViewModel by lazy {
        ViewModelProvider(this)[PatientsViewModel::class.java]
        // Or use dependency injection (Hilt, Koin, etc.)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Access binding via 'binding' property from BaseFragment
        binding.textViewPatientsTitle.text = "Patients List" // Use binding directly

        // TODO: Initialize RecyclerView Adapter
        // TODO: Set up search functionality (observe EditText changes, update ViewModel)
        // TODO: Observe ViewModel LiveData/StateFlow for patient data and update Adapter
        // viewModel.patientList.observe(viewLifecycleOwner) { patients -> ... }
    }

} 