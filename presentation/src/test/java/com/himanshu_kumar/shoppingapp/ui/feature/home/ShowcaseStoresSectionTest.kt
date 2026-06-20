package com.himanshu_kumar.shoppingapp.ui.feature.home

import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.shoppingapp.ui.feature.store.SHOWCASE_STORE_SLUGS
import com.himanshu_kumar.shoppingapp.ui.feature.store.resolveShowcaseStores
import com.himanshu_kumar.shoppingapp.ui.feature.store.storeLogoRes
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

class ShowcaseStoresSectionTest {

    @Test
    fun `showcase stores always include three partners in order`() {
        val apiStores = listOf(
            store(1, "DRC-Kältetechnik", "drc-kaltetechnik"),
            store(2, "Other Shop", "other-shop"),
        )

        val result = resolveShowcaseStores(apiStores)

        assertEquals(3, result.size)
        assertEquals(
            listOf("drc-kaltetechnik", "kaeltekontor-hamburg", "nordklima-technik"),
            result.map { it.slug },
        )
    }

    @Test
    fun `fallback mock stores used when API omits partners`() {
        val result = resolveShowcaseStores(emptyList())

        assertEquals(3, result.size)
        assertEquals("Kältekontor Hamburg", result[1].name)
        assertEquals("NordKlima Technik", result[2].name)
    }

    @Test
    fun `logo mapping covers all showcase slugs`() {
        SHOWCASE_STORE_SLUGS.forEach { slug ->
            assertFalse(
                "Missing logo for $slug",
                storeLogoRes(slug) == 0,
            )
        }
    }

    private fun store(id: Int, name: String, slug: String) = StoreModel(
        id = id,
        name = name,
        slug = slug,
        logo = "",
        description = "",
        isFeatured = true,
    )
}
