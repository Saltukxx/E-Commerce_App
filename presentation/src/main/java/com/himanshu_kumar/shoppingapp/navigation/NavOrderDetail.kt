package com.himanshu_kumar.shoppingapp.navigation

import com.himanshu_kumar.domain.model.OrderProductItem
import com.himanshu_kumar.domain.model.OrdersData
import kotlinx.serialization.Serializable

@Serializable
data class NavOrderDetail(
    val id: Int,
    val items: List<NavOrderLine>,
    val orderDate: String,
    val status: String,
    val totalAmount: Double,
    val userId: Int,
)

@Serializable
data class NavOrderLine(
    val id: Int,
    val orderId: Int,
    val price: Double,
    val productId: Int,
    val productName: String,
    val quantity: Int,
    val userId: Int,
)

fun OrdersData.toNavOrderDetail(): NavOrderDetail =
    NavOrderDetail(
        id = id,
        items = items.map { it.toNavLine() },
        orderDate = orderDate,
        status = status,
        totalAmount = totalAmount,
        userId = userId,
    )

fun OrderProductItem.toNavLine(): NavOrderLine =
    NavOrderLine(
        id = id,
        orderId = orderId,
        price = price,
        productId = productId,
        productName = productName,
        quantity = quantity,
        userId = userId,
    )
