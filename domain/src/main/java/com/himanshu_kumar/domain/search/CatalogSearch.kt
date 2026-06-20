package com.himanshu_kumar.domain.search

import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.domain.model.ProductListModel
import java.util.Locale

/**
 * Client-side catalog filtering: normalized query + Turkish-aware case folding for İ/i
 * and related locale edge cases.
 */
object CatalogSearch {

    /** Minimum characters for API catalog search (GET /products?q=…). */
    const val MIN_SERVER_QUERY_LEN = 2

    private val turkishLocale = Locale.forLanguageTag("tr-TR")

    fun normalizeQuery(raw: String): String =
        raw.trim().replace(Regex("\\s+"), " ")

    fun productMatches(product: ProductListModel, normalizedQuery: String): Boolean {
        if (normalizedQuery.isEmpty()) return true
        return fieldContains(product.title, normalizedQuery) ||
            fieldContains(product.description, normalizedQuery) ||
            fieldContains(product.slug, normalizedQuery) ||
            fieldContains(product.category.name, normalizedQuery) ||
            fieldContains(product.category.slug, normalizedQuery)
    }

    fun categoryMatches(category: CategoriesListModel, normalizedQuery: String): Boolean {
        if (normalizedQuery.isEmpty()) return true
        return fieldContains(category.name, normalizedQuery) ||
            fieldContains(category.slug, normalizedQuery)
    }

    private fun fieldContains(haystack: String, needle: String): Boolean {
        if (needle.isEmpty()) return true
        val h = haystack.uppercase(turkishLocale)
        val n = needle.uppercase(turkishLocale)
        return h.contains(n)
    }
}
