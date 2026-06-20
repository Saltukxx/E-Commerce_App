package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.model.CartItemModel
import kotlinx.serialization.Serializable

@Serializable
data class CartItem(
    val id: Int,
    val productId: Int,
    val userId: Int,
    val name: String,
    val price: Int,
    val imageUrl: String?,
    val quantity: Int,
    val productName: String,
    val storeId: Int = 0,
    val storeName: String = "",
) {
    fun toCartItemModel(): CartItemModel {
        return CartItemModel(
            id = id,
            productId = productId,
            userId = userId,
            name = name,
            price = price,
            imageUrl = imageUrl,
            quantity = quantity,
            productName = productName,
            storeId = storeId,
            storeName = storeName,
        )
    }
}
