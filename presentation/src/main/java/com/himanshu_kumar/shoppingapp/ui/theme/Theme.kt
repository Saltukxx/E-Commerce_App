package com.himanshu_kumar.shoppingapp.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Navy800,
    onPrimary = Color.White,
    secondary = Navy700,
    onSecondary = Color.White,
    tertiary = NavyLight,
    background = Navy900,
    surface = Color(0xFF0F1F2E),
    onBackground = Color.White,
    onSurface = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = Navy900,
    onPrimary = Color.White,
    secondary = NavyLight,
    onSecondary = Navy900,
    tertiary = Navy800,
    background = Color.White,
    surface = Color.White,
    onBackground = Color(0xFF0A1628),
    onSurface = Color(0xFF0A1628)
)

@Composable
fun DurmusBabaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}
