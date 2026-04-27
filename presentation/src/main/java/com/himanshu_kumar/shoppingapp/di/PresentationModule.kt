package com.himanshu_kumar.shoppingapp.di

import com.himanshu_kumar.data.network.NetworkEnvironment
import com.himanshu_kumar.shoppingapp.AppSession
import com.himanshu_kumar.shoppingapp.BuildConfig
import com.himanshu_kumar.shoppingapp.UserSession
import org.koin.dsl.module

val presentationModule = module {
    single { AppSession(get()) }
    single<UserSession> { get<AppSession>() }
    single {
        NetworkEnvironment(
            baseUrl = BuildConfig.API_BASE_URL,
            tokenProvider = get<AppSession>(),
        )
    }
    includes(viewModelModule)
}
