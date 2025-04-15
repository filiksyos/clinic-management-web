package com.ferhatozcelik.androidmvvmtemplate.common.domain.session

interface SessionManager {

    fun getAccessToken(): String?

    fun saveAccessToken(token: String)

    fun getRefreshToken(): String?

    fun saveRefreshToken(token: String)

    fun saveTokens(accessToken: String, refreshToken: String)

    fun isLoggedIn(): Boolean

    fun setLoggedIn(email: String)

    fun setLoggedOut()
} 