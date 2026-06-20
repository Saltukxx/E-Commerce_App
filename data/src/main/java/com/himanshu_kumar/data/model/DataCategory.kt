package com.himanshu_kumar.data.model

import com.himanshu_kumar.domain.catalog.CategoryDisplayNames
import com.himanshu_kumar.domain.model.ProductCategory
import kotlinx.serialization.Serializable

@Serializable
data class DataCategory(
    val creationAt: String,
    val id: Int,
    val image: String,
    val name: String,
    val slug: String,
    val updatedAt: String
){
    fun toProductCategory() = ProductCategory(
        creationAt = creationAt,
        id = id,
        image = image,
        name = CategoryDisplayNames.germanName(slug, name),
        slug = slug,
        updatedAt = updatedAt
    )
}