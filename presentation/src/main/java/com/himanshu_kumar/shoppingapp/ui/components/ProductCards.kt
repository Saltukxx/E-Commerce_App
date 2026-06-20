package com.himanshu_kumar.shoppingapp.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.compose.SubcomposeAsyncImage
import coil.request.ImageRequest
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.utils.CurrencyUtils
import com.himanshu_kumar.shoppingapp.utils.ImageUrlUtils

private const val COMPACT_THUMB_MAX_PX = 384
private const val LIST_THUMB_MAX_PX = 336

@Composable
fun CompactProductCard(
    product: ProductListModel,
    onClick: (ProductListModel) -> Unit,
    modifier: Modifier = Modifier,
    onStoreClick: ((slug: String, name: String) -> Unit)? = null,
) {
    Card(
        modifier = modifier
            .width(152.dp)
            .height(216.dp)
            .clickable { onClick(product) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        border = BorderStroke(1.dp, Color.Black.copy(alpha = 0.06f)),
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            ProductImage(
                product = product,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(118.dp),
                maxEdgePx = COMPACT_THUMB_MAX_PX,
            )
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 10.dp, vertical = 8.dp),
            ) {
                Text(
                    text = product.category.name,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.72f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (product.storeName.isNotBlank()) {
                    Text(
                        text = stringResource(R.string.sold_by, product.storeName),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.85f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = if (onStoreClick != null && product.storeSlug.isNotBlank()) {
                            Modifier.clickable {
                                onStoreClick(product.storeSlug, product.storeName)
                            }
                        } else {
                            Modifier
                        },
                    )
                }
                Text(
                    text = product.title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 2.dp),
                )
                Spacer(modifier = Modifier.weight(1f))
                Text(
                    text = CurrencyUtils.formatProductPriceCentsForDisplay(
                        product.price,
                        stringResource(R.string.price_on_request),
                    ),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
        }
    }
}

@Composable
fun ProductListCard(
    product: ProductListModel,
    onClick: (ProductListModel) -> Unit,
    modifier: Modifier = Modifier,
    onStoreClick: ((slug: String, name: String) -> Unit)? = null,
    showSoldBy: Boolean = true,
) {
    val priceLabel = CurrencyUtils.formatProductPriceCentsForDisplay(
        product.price,
        stringResource(R.string.price_on_request),
    )
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick(product) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = BorderStroke(1.dp, Color.Black.copy(alpha = 0.06f)),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.Top,
        ) {
            ProductImage(
                product = product,
                modifier = Modifier
                    .size(104.dp)
                    .clip(RoundedCornerShape(12.dp)),
                maxEdgePx = LIST_THUMB_MAX_PX,
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(
                modifier = Modifier.weight(1f),
            ) {
                Text(
                    text = product.category.name,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.72f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (showSoldBy && product.storeName.isNotBlank()) {
                    Text(
                        text = stringResource(R.string.sold_by, product.storeName),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = if (onStoreClick != null && product.storeSlug.isNotBlank()) {
                            Modifier.clickable {
                                onStoreClick(product.storeSlug, product.storeName)
                            }
                        } else {
                            Modifier
                        },
                    )
                }
                Text(
                    text = product.title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 4.dp),
                )
                if (product.description.isNotBlank()) {
                    Text(
                        text = product.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.55f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = priceLabel,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun ProductImage(
    product: ProductListModel,
    modifier: Modifier = Modifier,
    maxEdgePx: Int = 512,
) {
    val imageUrl = ImageUrlUtils.cacheBust(product.images.firstOrNull())
    val context = LocalContext.current
    val model = remember(imageUrl, maxEdgePx) {
        if (imageUrl.isNullOrBlank()) {
            null
        } else {
            ImageRequest.Builder(context)
                .data(imageUrl)
                .size(maxEdgePx, maxEdgePx)
                .crossfade(false)
                .build()
        }
    }
    Box(
        modifier = modifier.background(Color.LightGray.copy(alpha = 0.22f)),
        contentAlignment = Alignment.Center,
    ) {
        if (model == null) {
            Text(
                text = product.category.name.take(1).ifBlank { "D" },
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.55f),
                fontWeight = FontWeight.SemiBold,
            )
        } else {
            SubcomposeAsyncImage(
                model = model,
                contentDescription = product.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                loading = {
                    Text(
                        text = "…",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                    )
                },
                error = {
                    Image(
                        painter = painterResource(R.drawable.ic_product_placeholder),
                        contentDescription = product.title,
                        contentScale = ContentScale.Inside,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp),
                    )
                },
            )
        }
    }
}
