package com.himanshu_kumar.shoppingapp.ui.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.utils.ImageUrlUtils
import com.himanshu_kumar.shoppingapp.ui.feature.store.storeLogoRes
import com.himanshu_kumar.shoppingapp.ui.feature.store.storeTaglineRes

private val StoreCardShape = RoundedCornerShape(16.dp)

@Composable
fun ShowcaseStoresSection(
    stores: List<StoreModel>,
    onStoreClick: (String, String) -> Unit,
    onViewAllStores: () -> Unit,
    modifier: Modifier = Modifier,
) {
    if (stores.isEmpty()) return
    val primary = colorResource(R.color.stitch_primary)
    val outlineVariant = colorResource(R.color.outline_variant)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 32.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = stringResource(R.string.home_showcase_stores_title),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = primary,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = stringResource(R.string.home_showcase_stores_subtitle),
                    style = MaterialTheme.typography.bodySmall,
                    color = colorResource(R.color.on_surface_variant),
                )
            }
            TextButton(onClick = onViewAllStores) {
                Text(
                    text = stringResource(R.string.view_all),
                    style = MaterialTheme.typography.labelLarge,
                    color = primary,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
        Spacer(Modifier.height(16.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(stores, key = { it.slug }) { store ->
                ShowcaseStoreCard(
                    store = store,
                    onClick = { onStoreClick(store.slug, store.name) },
                    primary = primary,
                    outlineVariant = outlineVariant,
                )
            }
        }
    }
}

@Composable
private fun ShowcaseStoreCard(
    store: StoreModel,
    onClick: () -> Unit,
    primary: Color,
    outlineVariant: Color,
) {
    val tagline = store.description.ifBlank {
        stringResource(storeTaglineRes(store.slug))
    }
    Surface(
        modifier = Modifier
            .size(width = 200.dp, height = 220.dp)
            .clickable(onClick = onClick),
        shape = StoreCardShape,
        color = Color.White,
        shadowElevation = 2.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, outlineVariant.copy(alpha = 0.45f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            ShowcaseStoreLogo(store = store)
            Text(
                text = store.name,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = primary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = tagline,
                style = MaterialTheme.typography.bodySmall,
                color = colorResource(R.color.on_surface_variant),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f),
            )
            Text(
                text = stringResource(R.string.visit_store),
                style = MaterialTheme.typography.labelMedium,
                color = primary,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun ShowcaseStoreLogo(store: StoreModel) {
    val logoRes = storeLogoRes(store.slug)
    Box(
        modifier = Modifier
            .size(56.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(colorResource(R.color.secondary_container))
            .border(1.dp, colorResource(R.color.outline_variant).copy(alpha = 0.35f), RoundedCornerShape(12.dp)),
        contentAlignment = Alignment.Center,
    ) {
        if (store.logo.isNotBlank()) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(ImageUrlUtils.resolveImageUrl(store.logo))
                    .crossfade(true)
                    .build(),
                contentDescription = store.name,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop,
            )
        } else {
            Image(
                painter = painterResource(logoRes),
                contentDescription = store.name,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(12.dp)),
                contentScale = ContentScale.Crop,
            )
        }
    }
}
