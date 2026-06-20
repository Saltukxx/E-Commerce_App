package com.himanshu_kumar.data.model.request

import kotlinx.serialization.Serializable

@Serializable
data class StoreApplicationRequestBody(
    val businessName: String,
    val contactName: String,
    val contactEmail: String,
    val phone: String = "",
    val message: String = "",
)
