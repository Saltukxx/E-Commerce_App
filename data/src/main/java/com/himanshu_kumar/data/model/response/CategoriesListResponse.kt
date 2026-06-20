package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.catalog.CategoryDisplayNames
import com.himanshu_kumar.domain.model.CategoriesListModel
import kotlinx.serialization.Serializable

@Serializable
data class CategoriesListWrapper(
    val data: List<CategoriesListResponse> = emptyList(),
    val msg: String = "",
)

@Serializable
data class CategoriesListResponse(
    val creationAt: String,
    val id: Int,
    val image: String,
    val name: String,
    val slug: String,
    val updatedAt: String,
) {
    fun toCategoryListModel() = CategoriesListModel(
        creationAt = creationAt,
        id = id,
        image = image,
        name = CategoryDisplayNames.germanName(slug, name),
        slug = slug,
        updatedAt = updatedAt,
    )
}
