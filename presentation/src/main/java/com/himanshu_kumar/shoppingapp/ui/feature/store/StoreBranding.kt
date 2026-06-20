package com.himanshu_kumar.shoppingapp.ui.feature.store

import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.shoppingapp.R

val SHOWCASE_STORE_SLUGS = listOf(
    "drc-kaltetechnik",
    "kaeltekontor-hamburg",
    "nordklima-technik",
)

fun resolveShowcaseStores(apiStores: List<StoreModel>): List<StoreModel> {
    val active = apiStores.filter { it.id > 0 }
    val featured = active.filter { it.isFeatured }
    if (featured.isNotEmpty()) {
        return featured.take(6)
    }

    val bySlug = active.associateBy { it.slug.lowercase() }
    val fromAllowlist = SHOWCASE_STORE_SLUGS.mapNotNull { slug ->
        bySlug[slug] ?: fallbackShowcaseStore(slug)
    }
    if (fromAllowlist.isNotEmpty()) return fromAllowlist

    return active.take(3)
}

private fun fallbackShowcaseStore(slug: String): StoreModel? = when (slug) {
    "drc-kaltetechnik" -> StoreModel(
        id = 0,
        name = "DRC-Kältetechnik",
        slug = slug,
        logo = "",
        description = "",
        isFeatured = true,
    )
    "kaeltekontor-hamburg" -> StoreModel(
        id = -1,
        name = "Kältekontor Hamburg",
        slug = slug,
        logo = "",
        description = "",
        isFeatured = true,
    )
    "nordklima-technik" -> StoreModel(
        id = -2,
        name = "NordKlima Technik",
        slug = slug,
        logo = "",
        description = "",
        isFeatured = true,
    )
    else -> null
}

@DrawableRes
fun storeLogoRes(slug: String): Int = when (slug.lowercase()) {
    "drc-kaltetechnik" -> R.drawable.store_logo_drc_kaltetechnik
    "kaeltekontor-hamburg" -> R.drawable.store_logo_kaeltekontor_hamburg
    "nordklima-technik" -> R.drawable.store_logo_nordklima_technik
    else -> R.drawable.ic_brand_logo
}

@DrawableRes
fun storeBannerRes(slug: String): Int? = when (slug.lowercase()) {
    "drc-kaltetechnik" -> R.drawable.store_banner_drc_kaltetechnik
    "kaeltekontor-hamburg" -> R.drawable.store_banner_kaeltekontor_hamburg
    "nordklima-technik" -> R.drawable.store_banner_nordklima_technik
    else -> null
}

@StringRes
fun storeTaglineRes(slug: String): Int = when (slug.lowercase()) {
    "drc-kaltetechnik" -> R.string.home_store_drc_kaltetechnik_tagline
    "kaeltekontor-hamburg" -> R.string.home_store_kaeltekontor_tagline
    "nordklima-technik" -> R.string.home_store_nordklima_tagline
    else -> R.string.visit_store
}

@Composable
fun storeBannerFallbackBrush(slug: String): Brush {
    val colors = when (slug.lowercase()) {
        "drc-kaltetechnik" -> listOf(Color(0xFF001529), Color(0xFF003366))
        "kaeltekontor-hamburg" -> listOf(Color(0xFF1565C0), Color(0xFF0A3D7A))
        "nordklima-technik" -> listOf(Color(0xFF00838F), Color(0xFF004D57))
        else -> listOf(Color(0xFF001529), Color(0xFF003366))
    }
    return Brush.horizontalGradient(colors)
}
