package com.himanshu_kumar.domain.model

data class SummaryData(
    val discount: Double,
    val items: List<CartItemModel>,
    val groups: List<VendorCartGroup> = emptyList(),
    val shipping: Double,
    val subtotal: Double,
    val tax: Double,
    val total: Double,
    val grandSubtotal: Double = subtotal,
    val grandShipping: Double = shipping,
    val grandTax: Double = tax,
    val grandTotal: Double = total,
    val warnings: List<String> = emptyList(),
)
