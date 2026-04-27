# Keep line numbers for stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Koin
-keep class org.koin.** { *; }
-dontwarn org.koin.**

# Ktor (client logging -> SLF4J; no impl on Android)
-dontwarn org.slf4j.impl.StaticLoggerBinder
-dontwarn org.slf4j.**

# Ktor
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**
-keepclassmembers class io.ktor.client.** { *; }

# kotlinx-serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers @kotlinx.serialization.Serializable class * {
    *** Companion;
}
-keep @kotlinx.serialization.Serializable class * { *; }
-keepclassmembers @kotlinx.serialization.SerialName class * { *; }

# Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}

# Coil
-keep public class * implements coil.ImageLoaderFactory
-keep public class * implements coil.decode.Decoder
-keep public class * implements coil.fetch.Fetcher
-keep public class * implements coil.map.Mapper
-dontwarn coil.**

# Android / Compose
-keep public class * extends java.lang.Throwable
-keep class androidx.startup.InitializationProvider { *; }

# Parcelize (used in app)
-keep @kotlinx.parcelize.Parcelize class * { *; }
