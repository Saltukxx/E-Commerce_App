package com.himanshu_kumar.domain.model

data class OrdersData(
    val id: Int,
    val items: List<OrderProductItem>,
    val orderDate: String,
    val status: String,
    val totalAmount: Double,
    val userId: Int,
    val storeId: Int = 0,
    val storeName: String = "",
)
