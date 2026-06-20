package com.himanshu_kumar.data.model.response

import kotlinx.serialization.Serializable

@Serializable
data class ApiMessageResponse(
    val msg: String = "",
)
