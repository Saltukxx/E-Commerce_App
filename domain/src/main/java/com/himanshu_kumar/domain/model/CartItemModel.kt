package com.himanshu_kumar.domain.model

data class CartItemModel(
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
)
