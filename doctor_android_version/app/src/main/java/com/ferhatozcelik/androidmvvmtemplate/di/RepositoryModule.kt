package com.ferhatozcelik.androidmvvmtemplate.di

import com.ferhatozcelik.androidmvvmtemplate.data.repository.ExampleRepositoryImp
import com.ferhatozcelik.androidmvvmtemplate.data.services.AppService
import com.ferhatozcelik.androidmvvmtemplate.domain.repository.ExampleRepository
import org.koin.dsl.module
import retrofit2.Retrofit

val repositoryModule = module {
    // AppService
    single { 
        get<Retrofit>().create(AppService::class.java)
    }
    
    // ExampleRepository
    single<ExampleRepository> { 
        ExampleRepositoryImp(get(), get())
    }
} 