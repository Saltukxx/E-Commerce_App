package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.model.StoreSummaryModel
import kotlinx.serialization.Serializable

@Serializable
data class StoreSummaryDto(
    val id: Int,
    val name: String,
    val slug: String,
    val logo: String = "",
) {
    fun toDomain() = StoreSummaryModel(id = id, name = name, slug = slug, logo = logo)
}

@Serializable
data class StoreDto(
    val id: Int,
    val name: String,
    val slug: String,
    val logo: String = "",
    val banner: String = "",
    val description: String = "",
    val isFeatured: Boolean = false,
    val contactEmail: String = "",
    val phone: String = "",
) {
    fun toDomain() = StoreModel(
        id = id,
        name = name,
        slug = slug,
        logo = logo,
        banner = banner,
        description = description,
        isFeatured = isFeatured,
        contactEmail = contactEmail,
        phone = phone,
    )
}

@Serializable
data class StoresListResponse(
    val data: List<StoreDto> = emptyList(),
    val msg: String = "",
)

@Serializable
data class StoreDetailResponse(
    val data: StoreDto,
    val msg: String = "",
)
