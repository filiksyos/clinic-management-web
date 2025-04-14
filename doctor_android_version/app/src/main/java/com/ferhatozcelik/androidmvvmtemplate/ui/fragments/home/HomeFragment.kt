package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.home

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.TextView
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
        } catch (e: Exception) {
            Log.e(TAG, "Error setting home text: ${e.message}")
            // Fallback to findViewById
            view.findViewById<TextView>(R.id.textViewHomeTitle)?.text = "Welcome to Doctor Dashboard"
        }
        
        // Set activity title
        activity?.title = "Home"
    }
}