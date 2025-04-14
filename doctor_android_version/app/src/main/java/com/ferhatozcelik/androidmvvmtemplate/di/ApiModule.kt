package com.ferhatozcelik.androidmvvmtemplate.di

import com.ferhatozcelik.androidmvvmtemplate.BuildConfig
import com.ferhatozcelik.androidmvvmtemplate.util.BASE_URL
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import org.koin.dsl.module
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

val apiModule = module {
    // HttpLoggingInterceptor as a singleton
    single { 
        HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
    }
    
    // OkHttpClient as a singleton
    single { 
        if (BuildConfig.DEBUG) {
            OkHttpClient.Builder()
                .addInterceptor(get<HttpLoggingInterceptor>())
                .build()
        } else {
            OkHttpClient.Builder().build()
        }
    }
    
    // Retrofit as a singleton
    single { 
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(get())
            .build()
    }
}