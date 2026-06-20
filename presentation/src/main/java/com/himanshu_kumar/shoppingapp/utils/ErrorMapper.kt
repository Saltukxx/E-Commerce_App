package com.himanshu_kumar.shoppingapp.utils

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.himanshu_kumar.shoppingapp.R

object ErrorMapper {
    @Composable
    fun toUserMessage(raw: String?): String {
        if (raw.isNullOrBlank()) return stringResource(R.string.error_generic)
        val normalized = raw.trim().lowercase()
        return when {
            normalized.contains("log in") || normalized.contains("login") ->
                stringResource(R.string.login_required)
            normalized.contains("network") || normalized.contains("connection") ||
                normalized.contains("timeout") || normalized.contains("host") ->
                stringResource(R.string.error_network)
            normalized.contains("cancel") && normalized.contains("payment") ->
                stringResource(R.string.error_payment_cancelled)
            normalized.contains("forbidden") || normalized.contains("unpaid checkout is disabled") ->
                stringResource(R.string.error_checkout_card_required)
            normalized.contains("not found") ->
                stringResource(R.string.error_not_found)
            normalized == "something went wrong" ->
                stringResource(R.string.error_generic)
            else -> raw
        }
    }
}
