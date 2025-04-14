package com.ferhatozcelik.androidmvvmtemplate.di

import com.ferhatozcelik.androidmvvmtemplate.ui.fragments.detail.DetailViewModel
import com.ferhatozcelik.androidmvvmtemplate.ui.fragments.home.HomeViewModel
import org.koin.dsl.module

val viewModelModule = module {
    // We no longer need to define ViewModels here since they're 
    // instantiated directly in fragments
} 