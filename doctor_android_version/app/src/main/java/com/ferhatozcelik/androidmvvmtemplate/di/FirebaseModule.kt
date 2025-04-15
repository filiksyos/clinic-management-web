package com.ferhatozcelik.androidmvvmtemplate.di

import com.ferhatozcelik.androidmvvmtemplate.data.firebase.FirebaseMessagingManager
import org.koin.dsl.module

/**
 * Dependency injection module for Firebase services
 */
val firebaseModule = module {
    // Provide FirebaseMessagingManager as a singleton
    single { FirebaseMessagingManager.getInstance() }
} 