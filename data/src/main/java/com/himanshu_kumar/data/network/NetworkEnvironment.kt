package com.himanshu_kumar.data.network

data class NetworkEnvironment(
    val baseUrl: String,
    val tokenProvider: AuthTokenProvider,
)
