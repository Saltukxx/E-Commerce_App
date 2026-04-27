package com.himanshu_kumar.data.di

import com.himanshu_kumar.data.network.NetworkEnvironment
import com.himanshu_kumar.data.network.NetworkServiceImpl
import com.himanshu_kumar.domain.network.NetworkService
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.request.header
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import org.koin.dsl.module


// This module focuses on configuring and providing the network-related components of the application.
val networkModule = module {
    single {
        val env: NetworkEnvironment = get()
        HttpClient(CIO) {
            install(HttpTimeout) {
                connectTimeoutMillis = 15_000
                requestTimeoutMillis = 60_000
                socketTimeoutMillis = 60_000
            }
            defaultRequest {
                val token = env.tokenProvider.getAccessToken()
                if (!token.isNullOrEmpty()) {
                    header(HttpHeaders.Authorization, "Bearer $token")
                }
            }
            install(ContentNegotiation) {
                json(
                    Json {
                        isLenient = true
                        ignoreUnknownKeys = true
                    },
                )
            }
        }
    }
    single<NetworkService> {
        NetworkServiceImpl(get(), get())
    }
}
