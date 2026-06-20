package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.model.CheckoutConfigModel
import com.himanshu_kumar.domain.model.CheckoutSessionModel
import com.himanshu_kumar.domain.model.CheckoutStatusModel
import com.himanshu_kumar.domain.model.OrderGroupResult
import com.himanshu_kumar.domain.model.PlacedOrderSummary
import kotlinx.serialization.Serializable

@Serializable
data class CheckoutConfigResponse(
    val data: CheckoutConfigData,
    val msg: String,
) {
    fun toDomain() = CheckoutConfigModel(
        paymentsEnabled = data.paymentsEnabled,
        publishableKey = data.publishableKey,
        multiVendorEnabled = data.multiVendorEnabled,
    )
}

@Serializable
data class CheckoutConfigData(
    val paymentsEnabled: Boolean,
    val publishableKey: String? = null,
    val multiVendorEnabled: Boolean = false,
)

@Serializable
data class CheckoutSessionResponse(
    val data: CheckoutSessionData,
    val msg: String,
) {
    fun toDomain() = CheckoutSessionModel(
        checkoutId = data.checkoutId,
        clientSecret = data.clientSecret,
        publishableKey = data.publishableKey,
        grandTotal = data.grandTotal,
    )
}

@Serializable
data class CheckoutSessionData(
    val checkoutId: Int,
    val clientSecret: String,
    val publishableKey: String? = null,
    val grandTotal: Double,
)

@Serializable
data class CheckoutStatusResponse(
    val data: CheckoutStatusData,
    val msg: String,
)

@Serializable
data class CheckoutStatusData(
    val checkoutId: Int,
    val paymentStatus: String,
    val grandTotal: Double,
    val paidAt: String? = null,
    val orders: List<PlacedOrderDto> = emptyList(),
) {
    fun toDomain() = CheckoutStatusModel(
        paymentStatus = paymentStatus,
        orderGroupResult = if (paymentStatus == "paid") toOrderGroupResult() else null,
    )

    fun toOrderGroupResult() = OrderGroupResult(
        orderGroupId = checkoutId.toLong(),
        grandTotal = grandTotal,
        orders = orders.map {
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
