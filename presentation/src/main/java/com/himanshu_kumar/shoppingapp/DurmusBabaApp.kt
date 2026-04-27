package com.himanshu_kumar.shoppingapp

import android.app.Application
import com.himanshu_kumar.data.di.dataModule
import com.himanshu_kumar.domain.di.domainModule
import com.himanshu_kumar.shoppingapp.di.presentationModule
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class DurmusBabaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@DurmusBabaApp)
            modules(
                listOf(
                    presentationModule,
                    dataModule,
                    domainModule
                )
            )
        }
    }
}
