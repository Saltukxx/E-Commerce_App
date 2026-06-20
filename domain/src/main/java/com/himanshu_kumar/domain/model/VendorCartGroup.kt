package com.himanshu_kumar.domain.model

data class VendorCartGroup(
    val storeId: Int,
    val storeName: String,
    val items: List<CartItemModel>,
    val subtotal: Double,
    val shipping: Double,
    val tax: Double,
    val total: Double,
)
