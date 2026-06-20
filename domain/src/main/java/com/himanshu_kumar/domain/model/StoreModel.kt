package com.himanshu_kumar.domain.model

data class StoreModel(
    val id: Int,
    val name: String,
    val slug: String,
    val logo: String,
    val banner: String = "",
    val description: String,
    val isFeatured: Boolean = false,
    val contactEmail: String = "",
    val phone: String = "",
)

data class StoreSummaryModel(
    val id: Int,
    val name: String,
    val slug: String,
    val logo: String = "",
)
