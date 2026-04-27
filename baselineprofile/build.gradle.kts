plugins {
    id("com.android.test")
    id("androidx.baselineprofile")
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.himanshu_kumar.baselineprofile"
    compileSdk = 35
    defaultConfig {
        minSdk = 24
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    targetProjectPath = ":presentation"
    @Suppress("UnstableApiUsage")
    experimentalProperties["android.experimental.self-instrumenting"] = true
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions { jvmTarget = "11" }
}

dependencies {
    implementation("androidx.benchmark:benchmark-macro-junit4:1.3.0")
    implementation(libs.junit)
    implementation("androidx.test.ext:junit:1.2.1")
    implementation("androidx.test:runner:1.5.2")
    implementation("androidx.test:rules:1.5.0")
    implementation("androidx.test.uiautomator:uiautomator:2.3.0")
}

baselineProfile {
    useConnectedDevices = true
}
