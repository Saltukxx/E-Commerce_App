package com.himanshu_kumar.data.model.response

import kotlinx.serialization.Serializable

@Serializable
data class PriceInquiryResponse(
    val msg: String,
    val data: PriceInquiryRow? = null,
)

@Serializable
data class PriceInquiryRow(
    val id: Int,
)
