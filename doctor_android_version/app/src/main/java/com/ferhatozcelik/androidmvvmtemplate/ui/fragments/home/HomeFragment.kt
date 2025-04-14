package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.home

import android.os.Bundle
import android.view.View
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
    }
}