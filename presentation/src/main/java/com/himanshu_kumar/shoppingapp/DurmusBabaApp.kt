package com.himanshu_kumar.shoppingapp

import android.app.Application
import androidx.profileinstaller.ProfileInstaller
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.disk.DiskCache
import coil.memory.MemoryCache
import com.himanshu_kumar.data.di.dataModule
import com.himanshu_kumar.domain.di.domainModule
import com.himanshu_kumar.shoppingapp.di.presentationModule
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class DurmusBabaApp : Application(), ImageLoaderFactory {
    override fun onCreate() {
        super.onCreate()
        ProfileInstaller.writeProfile(this)
        startKoin {
            androidContext(this@DurmusBabaApp)
            modules(
                listOf(
                    presentationModule,
                    dataModule,
                    domainModule,
                ),
            )
        }
    }

    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .crossfade(0)
            .memoryCache {
                MemoryCache.Builder(this)
                    .maxSizePercent(0.20)
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(cacheDir.resolve("coil_disk_cache"))
                    .maxSizePercent(0.05)
                    .build()
            }
            .build()
    }
}
