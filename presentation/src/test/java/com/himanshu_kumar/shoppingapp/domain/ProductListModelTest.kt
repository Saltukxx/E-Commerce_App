package com.himanshu_kumar.shoppingapp.domain

import com.himanshu_kumar.domain.model.ProductCategory
import com.himanshu_kumar.domain.model.ProductListModel
import org.junit.Assert.assertEquals
import org.junit.Test

class ProductListModelTest {
    @Test
    fun missingStoreDefaultsToEmptyNotDurmusbaba() {
        val product = ProductListModel(
            category = ProductCategory(
                creationAt = "",
                id = 1,
                image = "",
                name = "Cat",
                slug = "cat",
                updatedAt = "",
            ),
            description = "d",
            id = 1,
            images = emptyList(),
            price = 100,
            slug = "p1",
            title = "Product",
            store = null,
        )
        assertEquals("", product.storeName)
        assertEquals("", product.storeSlug)
    }
}
