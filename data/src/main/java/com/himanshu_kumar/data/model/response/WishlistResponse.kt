package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.model.ProductListModel
import kotlinx.serialization.Serializable

@Serializable
data class WishlistResponse(
    val data: List<ProductListResponse>,
    val msg: String,
) {
    fun toProducts(): List<ProductListModel> = data.map { it.toProductList() }
}
