package com.ferhatozcelik.androidmvvmtemplate.di

import com.wiseria.common.domain.session.SessionManager
import com.wiseria.common.domain.session.SessionManagerImp
import org.koin.dsl.module

val sessionModule = module {
    // SessionManager as a singleton
    single<SessionManager> { 
        SessionManagerImp(get())
    }
} 