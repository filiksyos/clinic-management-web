package com.ferhatozcelik.androidmvvmtemplate.di

import androidx.room.Room
import com.ferhatozcelik.androidmvvmtemplate.data.local.AppDatabase
import kotlinx.coroutines.CoroutineScope
import org.koin.android.ext.koin.androidApplication
import org.koin.dsl.module

val databaseModule = module {
    // Room database as a singleton
    single { 
        Room.databaseBuilder(
            androidApplication(), 
            AppDatabase::class.java, 
            "local_database"
        )
        .fallbackToDestructiveMigration()
        .build()
    }
    
    // ExampleDao
    single { get<AppDatabase>().getExampleDao() }
}