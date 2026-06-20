package com.himanshu_kumar.shoppingapp.utils

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.himanshu_kumar.shoppingapp.R

object OrderStatusLabels {
    @Composable
    fun label(status: String): String = when (status) {
        "Pending" -> stringResource(R.string.order_status_pending)
        "Processing" -> stringResource(R.string.order_status_processing)
        "Shipped" -> stringResource(R.string.order_status_shipped)
        "Delivered" -> stringResource(R.string.order_status_delivered)
        "Cancelled" -> stringResource(R.string.order_status_cancelled)
        else -> status
    }
}
