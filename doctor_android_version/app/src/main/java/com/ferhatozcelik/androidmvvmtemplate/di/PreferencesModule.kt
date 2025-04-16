package com.ferhatozcelik.androidmvvmtemplate.di

import com.ferhatozcelik.androidmvvmtemplate.common.data.preferences.PreferenceManager
import com.ferhatozcelik.androidmvvmtemplate.common.data.preferences.Preferences
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

val preferencesModule = module {
    // Preferences as a singleton
    single<Preferences> { 
        PreferenceManager(androidContext())
    }
}
