package com.himanshu_kumar.data.model.response

import com.himanshu_kumar.domain.model.SummaryData
import com.himanshu_kumar.domain.model.VendorCartGroup
import kotlinx.serialization.Serializable

@Serializable
data class VendorCartGroupDto(
    val storeId: Int,
    val storeName: String,
    val items: List<CartItem> = emptyList(),
    val subtotal: Double,
    val shipping: Double,
    val tax: Double,
    val total: Double,
) {
    fun toDomain() = VendorCartGroup(
        storeId = storeId,
        storeName = storeName,
        items = items.map { it.toCartItemModel() },
        subtotal = subtotal,
        shipping = shipping,
        tax = tax,
        total = total,
    )
}

@Serializable
data class Summary(
    val discount: Double,
    val items: List<CartItem>,
    val groups: List<VendorCartGroupDto> = emptyList(),
    val shipping: Double,
    val subtotal: Double,
    val tax: Double,
    val total: Double,
    val grandSubtotal: Double = subtotal,
    val grandShipping: Double = shipping,
    val grandTax: Double = tax,
    val grandTotal: Double = total,
    val warnings: List<String> = emptyList(),
) {
    fun toSummaryData() = SummaryData(
        discount = discount,
        items = items.map { it.toCartItemModel() },
        groups = groups.map { it.toDomain() },
        shipping = shipping,
        subtotal = subtotal,
        tax = tax,
        total = total,
        grandSubtotal = grandSubtotal,
        grandShipping = grandShipping,
        grandTax = grandTax,
        grandTotal = grandTotal,
        warnings = warnings,
    )
}
