package com.himanshu_kumar.baselineprofile

import androidx.benchmark.macro.junit4.BaselineProfileRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class BaselineProfileGenerator {

    @get:Rule
    val rule = BaselineProfileRule()

    @Test
    fun startupAndScroll() = rule.collect(
        packageName = "com.himanshu_kumar.shoppingapp",
        maxIterations = 1,
    ) {
        pressHome()
        startActivityAndWait()
    }
}
