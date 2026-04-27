package com.himanshu_kumar.shoppingapp.utils

import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

object CurrencyUtils {
    fun formatPrice(price: Number, currency: String = "EUR"): String {
        val format = NumberFormat.getCurrencyInstance(Locale.GERMANY)
        format.currency = Currency.getInstance(currency)
        return format.format(price.toDouble())
    }
}
