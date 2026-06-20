package com.himanshu_kumar.domain.model

data class CheckoutConfigModel(
    val paymentsEnabled: Boolean,
    val publishableKey: String?,
    val multiVendorEnabled: Boolean,
)

data class CheckoutSessionModel(
    val checkoutId: Int,
    val clientSecret: String,
    val publishableKey: String?,
    val grandTotal: Double,
)

data class CheckoutStatusModel(
    val paymentStatus: String,
    val orderGroupResult: OrderGroupResult?,
)
