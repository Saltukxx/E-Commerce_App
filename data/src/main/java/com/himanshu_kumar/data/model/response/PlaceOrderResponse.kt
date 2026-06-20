package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.model.OrderGroupModel
import com.himanshu_kumar.domain.model.OrderGroupResult
import com.himanshu_kumar.domain.model.PlacedOrderSummary
import kotlinx.serialization.Serializable

@Serializable
data class PlaceOrderResponse(
    val data: OrderGroupData,
    val msg: String,
) {
    fun toDomain() = OrderGroupResult(
        orderGroupId = data.orderGroupId,
        grandTotal = data.grandTotal,
        orders = data.orders.map {
            PlacedOrderSummary(
                orderId = it.orderId,
                storeId = it.storeId,
                storeName = it.storeName,
                totalAmount = it.totalAmount,
                status = it.status,
            )
        },
    )
}

@Serializable
data class OrderGroupData(
    val orderGroupId: Long,
    val grandTotal: Double,
    val orders: List<PlacedOrderDto> = emptyList(),
)

@Serializable
data class PlacedOrderDto(
    val orderId: Long,
    val storeId: Int,
    val storeName: String,
    val totalAmount: Double,
    val status: String = "Pending",
)

@Serializable
data class OrderGroupListData(
    val orderGroupId: Int? = null,
    val orderDate: String,
    val grandTotal: Double,
    val orders: List<VendorOrderData> = emptyList(),
) {
    fun toDomain() = OrderGroupModel(
        orderGroupId = orderGroupId,
        orderDate = orderDate,
        grandTotal = grandTotal,
        orders = orders.map { it.toDomain(orderDate) },
    )
}

@Serializable
data class VendorOrderData(
    val orderId: Int,
    val storeId: Int = 0,
    val storeName: String = "",
    val status: String,
    val subtotal: Double = 0.0,
    val shipping: Double = 0.0,
    val tax: Double = 0.0,
    val totalAmount: Double,
    val items: List<OrderItem> = emptyList(),
) {
    fun toDomain(orderDate: String) = com.himanshu_kumar.domain.model.OrdersData(
        id = orderId,
        items = items.map { it.toDomainResponse() },
        orderDate = orderDate,
        status = status,
        totalAmount = totalAmount,
        userId = items.firstOrNull()?.userId ?: 0,
        storeId = storeId,
        storeName = storeName,
    )
}
