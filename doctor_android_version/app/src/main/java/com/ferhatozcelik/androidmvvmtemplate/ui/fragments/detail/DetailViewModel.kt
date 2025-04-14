package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.detail

import androidx.lifecycle.ViewModel
import com.ferhatozcelik.androidmvvmtemplate.domain.repository.ExampleRepository

class DetailViewModel(private val exampleRepository: ExampleRepository) : ViewModel() {
    private val TAG = DetailViewModel::class.java.simpleName

}