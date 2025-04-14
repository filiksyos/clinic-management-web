package com.ferhatozcelik.androidmvvmtemplate

import android.app.Application
import com.ferhatozcelik.androidmvvmtemplate.di.apiModule
import com.ferhatozcelik.androidmvvmtemplate.di.appModule
import com.ferhatozcelik.androidmvvmtemplate.di.databaseModule
import com.ferhatozcelik.androidmvvmtemplate.di.preferencesModule
import com.ferhatozcelik.androidmvvmtemplate.di.repositoryModule
import com.ferhatozcelik.androidmvvmtemplate.di.sessionModule
import com.ferhatozcelik.androidmvvmtemplate.di.viewModelModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class App : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        startKoin {
            androidLogger(Level.ERROR)
            androidContext(this@App)
            modules(
                listOf(
                    appModule,
                    apiModule,
                    databaseModule,
                    preferencesModule,
                    repositoryModule,
                    sessionModule,
                    viewModelModule
                )
            )
        }
    }
}