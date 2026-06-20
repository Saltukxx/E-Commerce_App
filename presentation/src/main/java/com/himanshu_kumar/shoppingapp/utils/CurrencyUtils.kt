package com.himanshu_kumar.shoppingapp.utils

import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

object CurrencyUtils {
    /** Whole-currency amounts (cart summary, order totals). */
    fun formatPrice(price: Number, currency: String = "EUR"): String {
        val format = NumberFormat.getCurrencyInstance(Locale.GERMANY)
        format.currency = Currency.getInstance(currency)
        return format.format(price.toDouble())
    }

    /** API product/cart line price: euro cents. [onRequestLabel] when [cents] is 0 (no list price). */
    fun formatProductPriceCentsForDisplay(cents: Int, onRequestLabel: String): String =
        if (cents == 0) onRequestLabel else formatEuroCents(cents)

    /** [amountCents] is euro cents (API / DB product & cart line prices). */
    fun formatEuroCents(amountCents: Int, currency: String = CURRENCY_EUR): String =
        formatPrice(amountCents / 100.0, currency)

    /** Line totals in cents (e.g. unit cents × quantity) may not fit in Int; use Double. */
    fun formatEuroCentsFromTotal(totalCents: Double, currency: String = CURRENCY_EUR): String =
        formatPrice(totalCents / 100.0, currency)

    private const val CURRENCY_EUR = "EUR"
}
