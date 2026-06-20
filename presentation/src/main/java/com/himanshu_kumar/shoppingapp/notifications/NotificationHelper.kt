package com.himanshu_kumar.shoppingapp.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

object NotificationHelper {
    const val CHANNEL_ORDERS = "orders"

    fun ensureDefaultChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(NotificationManager::class.java) ?: return
        if (manager.getNotificationChannel(CHANNEL_ORDERS) != null) return
        val channel = NotificationChannel(
            CHANNEL_ORDERS,
            "Bestellungen",
            NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
            description = "Bestell- und Preisanfrage-Benachrichtigungen"
        }
        manager.createNotificationChannel(channel)
    }
}
