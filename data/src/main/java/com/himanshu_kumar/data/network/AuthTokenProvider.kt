package com.himanshu_kumar.data.network

interface AuthTokenProvider {
    fun getAccessToken(): String?
    fun setAccessToken(token: String?)
    fun getRefreshToken(): String?
    fun setRefreshToken(token: String?)
    fun clearAuthTokens()
}
