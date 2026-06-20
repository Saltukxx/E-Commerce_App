package com.himanshu_kumar.domain.model

data class OrderGroupModel(
    val orderGroupId: Int?,
    val orderDate: String,
    val grandTotal: Double,
    val orders: List<OrdersData>,
)

data class OrderGroupResult(
    val orderGroupId: Long,
    val grandTotal: Double,
    val orders: List<PlacedOrderSummary>,
)

data class PlacedOrderSummary(
    val orderId: Long,
    val storeId: Int,
    val storeName: String,
    val totalAmount: Double,
    val status: String = "Pending",
)
