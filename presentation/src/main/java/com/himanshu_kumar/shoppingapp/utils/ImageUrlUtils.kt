package com.himanshu_kumar.shoppingapp.utils

import com.himanshu_kumar.shoppingapp.BuildConfig

object ImageUrlUtils {
    /** Prefix relative /uploads paths with the public origin (same host as nginx). */
    fun resolveImageUrl(path: String?): String? {
        if (path.isNullOrBlank()) return null
        val trimmed = path.trim()
        if (trimmed.startsWith("http://", ignoreCase = true) ||
            trimmed.startsWith("https://", ignoreCase = true)
        ) {
            return trimmed
        }
        val base = BuildConfig.UPLOADS_BASE.trimEnd('/')
        if (base.isEmpty()) return trimmed
        val normalized = if (trimmed.startsWith("/")) trimmed else "/$trimmed"
        return "$base$normalized"
    }

    fun cacheBust(url: String?): String? {
        val resolved = resolveImageUrl(url) ?: return null
        val version = BuildConfig.VERSION_CODE
        return if (resolved.contains("?")) {
            "$resolved&v=$version"
        } else {
            "$resolved?v=$version"
        }
    }
}
