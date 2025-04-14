package com.ferhatozcelik.androidmvvmtemplate.ui.fragments.home

import androidx.lifecycle.ViewModel
import com.ferhatozcelik.androidmvvmtemplate.domain.repository.ExampleRepository

class HomeViewModel(private val exampleRepository: ExampleRepository) : ViewModel() {
    private val TAG = HomeViewModel::class.java.simpleName

}