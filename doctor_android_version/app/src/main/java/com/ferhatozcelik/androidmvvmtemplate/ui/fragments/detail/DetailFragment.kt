package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.detail

import android.os.Bundle
import android.view.View
import com.ferhatozcelik.androidmvvmtemplate.databinding.FragmentDetailBinding
import com.ferhatozcelik.androidmvvmtemplate.domain.repository.ExampleRepository
import com.ferhatozcelik.androidmvvmtemplate.ui.base.BaseFragment
import org.koin.android.ext.android.inject

class DetailFragment : BaseFragment<FragmentDetailBinding, DetailViewModel>() {
    private val TAG = DetailFragment::class.java.simpleName
    
    private val exampleRepository: ExampleRepository by inject()
    override val viewModel by lazy { DetailViewModel(exampleRepository) }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
    }
}