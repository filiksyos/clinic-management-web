package com.ferhatozcelik.androidmvvmtemplate.di

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import org.koin.dsl.module

val appModule = module {
    // Application scope as a singleton
    single { CoroutineScope(SupervisorJob()) }
}