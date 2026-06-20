package com.himanshu_kumar.domain.model

data class StoreApplicationRequest(
    val businessName: String,
    val contactName: String,
    val contactEmail: String,
    val phone: String = "",
    val message: String = "",
)
