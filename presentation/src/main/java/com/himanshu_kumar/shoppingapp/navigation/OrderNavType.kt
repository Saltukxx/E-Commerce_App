package com.himanshu_kumar.shoppingapp.navigation

import android.os.Bundle
import androidx.navigation.NavType
import kotlinx.serialization.json.Json

val orderDetailNavType = object : NavType<NavOrderDetail>(isNullableAllowed = false) {
    override fun get(bundle: Bundle, key: String): NavOrderDetail? =
        bundle.getString(key)?.let { parseValue(it) }

    override fun parseValue(value: String): NavOrderDetail =
        Json.decodeFromString(NavOrderDetail.serializer(), value)

    override fun serializeAsValue(value: NavOrderDetail): String =
        Json.encodeToString(NavOrderDetail.serializer(), value)

    override fun put(bundle: Bundle, key: String, value: NavOrderDetail) {
        bundle.putString(key, serializeAsValue(value))
    }
}
