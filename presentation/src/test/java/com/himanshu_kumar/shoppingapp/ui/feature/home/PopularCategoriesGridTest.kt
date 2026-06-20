package com.himanshu_kumar.shoppingapp.ui.feature.home

import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.shoppingapp.R
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class PopularCategoriesGridTest {

    @Test
    fun `replaces Elektromaterial with compressor category`() {
        val categories = listOf(
            category(1, "Panel", "panel"),
            category(2, "Kaeltemittel", "kaeltemittel"),
            category(3, "Kuehlschraenke & Vitrinen", "kuehlschraenke-vitrinen"),
            category(4, "Elektromaterial", "elektromaterial"),
            category(5, "Embraco compressors", "embraco-compressors"),
        )

        val result = resolvePopularHomeCategories(categories)

        assertEquals(4, result.size)
        assertFalse(result.any { it.slug == "elektromaterial" })
        assertEquals("embraco-compressors", result.last().slug)
    }

    @Test
    fun `uses compressor fallback when not in first four categories`() {
        val categories = listOf(
            category(1, "Panel", "panel"),
            category(2, "Kaeltemittel", "kaeltemittel"),
            category(3, "Kuehlschraenke & Vitrinen", "kuehlschraenke-vitrinen"),
            category(4, "Elektromaterial", "elektromaterial"),
        )
        val compressor = category(99, "Embraco compressors", "embraco-compressors")

        val result = resolvePopularHomeCategories(categories, compressor)

        assertEquals(4, result.size)
        assertEquals("Kompressoren", popularCategoryLabel(result.last(), "Kompressoren"))
        assertEquals(99, result.last().id)
    }

    @Test
    fun `production verdichter category maps to Kompressoren`() {
        val categories = listOf(
            category(880, "Panel", "panel"),
            category(891, "Kaeltemittel", "kaeltemittel"),
            category(892, "Kuehlschraenke & Vitrinen", "kuehlschraenke-vitrinen"),
            category(896, "Elektromaterial", "elektromaterial"),
            category(899, "Isolierte Rohre", "isolierte-rohre"),
            category(969, "Verdichter", "verdichter"),
        )

        val result = resolvePopularHomeCategories(categories)

        assertEquals(4, result.size)
        assertEquals("verdichter", result.last().slug)
        assertEquals("Kompressoren", popularCategoryLabel(result.last(), "Kompressoren"))
        assertEquals(R.drawable.home_category_compressors, popularCategoryImageRes(result.last()))
        assertFalse(result.any { it.slug == "isolierte-rohre" })
        assertFalse(result.any { it.slug == "elektromaterial" })
    }

    @Test
    fun `compressor label uses German Kompressoren`() {
        val compressor = category(5, "Embraco compressors", "embraco-compressors")
        assertEquals("Kompressoren", popularCategoryLabel(compressor, "Kompressoren"))
    }

    @Test
    fun `category image mapping covers popular categories`() {
        assertEquals(
            R.drawable.home_category_panel,
            popularCategoryImageRes(category(1, "Panel", "panel")),
        )
        assertEquals(
            R.drawable.home_category_refrigerant,
            popularCategoryImageRes(category(2, "Kaeltemittel", "kaeltemittel")),
        )
        assertEquals(
            R.drawable.home_category_cooling_display,
            popularCategoryImageRes(category(3, "Kuehlschraenke & Vitrinen", "kuehlschraenke-vitrinen")),
        )
        assertEquals(
            R.drawable.home_category_compressors,
            popularCategoryImageRes(category(5, "Embraco compressors", "embraco-compressors")),
        )
    }

    private fun category(id: Int, name: String, slug: String) = CategoriesListModel(
        creationAt = "",
        id = id,
        image = "",
        name = name,
        slug = slug,
        updatedAt = "",
    )
}
