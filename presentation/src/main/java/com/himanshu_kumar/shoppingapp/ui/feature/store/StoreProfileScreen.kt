package com.himanshu_kumar.shoppingapp.ui.feature.store

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.search.CatalogSearch
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.ui.components.ProductListCard
import com.himanshu_kumar.shoppingapp.utils.ImageUrlUtils
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import org.koin.androidx.compose.koinViewModel
import org.koin.core.parameter.parametersOf

private val ProfileCardShape = RoundedCornerShape(20.dp)
private val LogoShape = RoundedCornerShape(14.dp)
private val PillShape = RoundedCornerShape(100.dp)

@Composable
fun StoreProfileScreen(
    navController: NavController,
    storeSlug: String,
    fallbackStoreName: String = "",
    viewModel: StoreProfileViewModel = koinViewModel { parametersOf(storeSlug) },
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val pageBackground = colorResource(R.color.home_background)

    Surface(modifier = Modifier.fillMaxSize(), color = pageBackground) {
        when (val state = uiState) {
            StoreProfileUiState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = colorResource(R.color.stitch_primary))
                }
            }
            is StoreProfileUiState.Error -> {
                StoreProfileErrorState(
                    title = fallbackStoreName.ifBlank { stringResource(R.string.sellers_title) },
                    message = state.message,
                    onBack = { navController.popBackStack() },
                )
            }
            is StoreProfileUiState.Success -> {
                StoreProfileContent(
                    store = state.store,
                    products = state.products,
                    hasMore = state.hasMore,
                    isLoadingMore = state.isLoadingMore,
                    loadMoreError = state.loadMoreError,
                    onBack = { navController.popBackStack() },
                    onProductClick = {
                        navController.navigate(ProductDetails(UiProductModel.fromProduct(it)))
                    },
                    onLoadMore = viewModel::loadNextPage,
                )
            }
        }
    }
}

@Composable
private fun StoreProfileErrorState(
    title: String,
    message: String,
    onBack: () -> Unit,
) {
    Column(Modifier.fillMaxSize()) {
        StoreProfileBackBar(title = title, onBack = onBack)
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(text = message, color = Color.Red)
        }
    }
}

@Composable
private fun StoreProfileContent(
    store: StoreModel,
    products: List<com.himanshu_kumar.domain.model.ProductListModel>,
    hasMore: Boolean,
    isLoadingMore: Boolean,
    loadMoreError: String?,
    onBack: () -> Unit,
    onProductClick: (com.himanshu_kumar.domain.model.ProductListModel) -> Unit,
    onLoadMore: () -> Unit,
) {
    var searchQuery by remember { mutableStateOf("") }
    var debouncedFilter by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(searchQuery) {
        delay(280)
        debouncedFilter = CatalogSearch.normalizeQuery(searchQuery)
    }

    val filtered = remember(products, debouncedFilter) {
        if (debouncedFilter.isEmpty()) products
        else products.filter { CatalogSearch.productMatches(it, debouncedFilter) }
    }

    LaunchedEffect(searchQuery, listState, hasMore, isLoadingMore) {
        if (searchQuery.isNotBlank()) return@LaunchedEffect
        snapshotFlow {
            val layout = listState.layoutInfo
            val total = layout.totalItemsCount
            if (total == 0) return@snapshotFlow false
            val lastVisible = layout.visibleItemsInfo.lastOrNull()?.index ?: -1
            val threshold = if (total > 3) total - 3 else total - 1
            lastVisible >= threshold
        }
            .distinctUntilChanged()
            .filter { it }
            .collect {
                if (hasMore && !isLoadingMore) onLoadMore()
            }
    }

    LazyColumn(
        state = listState,
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item(key = "hero") {
            StoreProfileHero(
                store = store,
                productCount = products.size,
                onBack = onBack,
            )
        }
        item(key = "search") {
            StoreSearchField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.padding(horizontal = 16.dp),
            )
        }
        item(key = "products_title") {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(R.string.store_products_title),
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = colorResource(R.color.stitch_primary),
                )
                if (products.isNotEmpty()) {
                    Text(
                        text = stringResource(R.string.store_product_count, products.size),
                        style = MaterialTheme.typography.labelMedium,
                        color = colorResource(R.color.on_surface_variant),
                    )
                }
            }
        }
        if (filtered.isEmpty()) {
            item(key = "empty") {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    val emptyMsg = if (searchQuery.isNotBlank()) {
                        stringResource(R.string.no_search_matches)
                    } else {
                        stringResource(R.string.store_no_products)
                    }
                    Text(
                        text = emptyMsg,
                        style = MaterialTheme.typography.bodyMedium,
                        color = colorResource(R.color.on_surface_variant),
                    )
                }
            }
        } else {
            items(filtered, key = { it.id }) { product ->
                ProductListCard(
                    product = product,
                    onClick = onProductClick,
                    modifier = Modifier.padding(horizontal = 16.dp),
                    showSoldBy = false,
                )
            }
            if (searchQuery.isBlank()) {
                item(key = "pagination_footer") {
                    when {
                        isLoadingMore -> {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(32.dp),
                                    color = colorResource(R.color.stitch_primary),
                                )
                            }
                        }
                        loadMoreError != null -> {
                            Text(
                                text = loadMoreError,
                                color = Color.Red,
                                style = MaterialTheme.typography.bodySmall,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp)
                                    .clickable { onLoadMore() },
                            )
                        }
                    }
                }
            }
        }
        item(key = "bottom_spacer") {
            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun StoreProfileHero(
    store: StoreModel,
    productCount: Int,
    onBack: () -> Unit,
) {
    val primary = colorResource(R.color.stitch_primary)
    val tagline = store.description.ifBlank { stringResource(storeTaglineRes(store.slug)) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(196.dp),
        ) {
            StoreBannerImage(store = store)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.08f),
                                Color.Black.copy(alpha = 0.42f),
                            ),
                        ),
                    ),
            )
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                StoreBackButton(onBack = onBack)
            }
        }
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .offset(y = (-42).dp),
            shape = ProfileCardShape,
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    StoreLogoImage(store = store, modifier = Modifier.size(72.dp))
                    Spacer(Modifier.size(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        if (store.isFeatured) {
                            StoreBadge(text = stringResource(R.string.store_verified_badge))
                            Spacer(Modifier.height(6.dp))
                        }
                        Text(
                            text = store.name,
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = primary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
                Text(
                    text = tagline,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colorResource(R.color.on_surface_variant),
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (productCount > 0) {
                        StoreInfoChip(
                            label = stringResource(R.string.store_product_count, productCount),
                        )
                    }
                    if (store.isFeatured) {
                        StoreInfoChip(label = stringResource(R.string.featured_seller))
                    }
                }
                if (store.contactEmail.isNotBlank() || store.phone.isNotBlank()) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = stringResource(R.string.store_contact_title),
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                            color = primary,
                        )
                        if (store.contactEmail.isNotBlank()) {
                            StoreContactRow(
                                iconRes = R.drawable.ic_profile_br,
                                text = store.contactEmail,
                            )
                        }
                        if (store.phone.isNotBlank()) {
                            StoreContactRow(
                                iconRes = R.drawable.ic_address,
                                text = store.phone,
                            )
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height((-30).dp))
    }
}

@Composable
private fun StoreBannerImage(store: StoreModel) {
    val context = LocalContext.current
    val remoteBanner = ImageUrlUtils.resolveImageUrl(store.banner)
    if (!remoteBanner.isNullOrBlank()) {
        AsyncImage(
            model = ImageRequest.Builder(context).data(remoteBanner).crossfade(true).build(),
            contentDescription = store.name,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alignment = Alignment.CenterStart,
        )
        return
    }
    val bannerRes = storeBannerRes(store.slug)
    if (bannerRes != null) {
        Image(
            painter = painterResource(bannerRes),
            contentDescription = store.name,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alignment = Alignment.CenterStart,
        )
    } else {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(storeBannerFallbackBrush(store.slug)),
        )
    }
}

@Composable
private fun StoreLogoImage(store: StoreModel, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val logoRes = storeLogoRes(store.slug)
    Box(
        modifier = modifier
            .clip(LogoShape)
            .background(colorResource(R.color.secondary_container))
            .border(1.dp, colorResource(R.color.outline_variant).copy(alpha = 0.35f), LogoShape),
    ) {
        if (store.logo.isNotBlank()) {
            AsyncImage(
                model = ImageRequest.Builder(context)
                    .data(ImageUrlUtils.resolveImageUrl(store.logo))
                    .crossfade(true)
                    .build(),
                contentDescription = store.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        } else {
            Image(
                painter = painterResource(logoRes),
                contentDescription = store.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }
    }
}

@Composable
private fun StoreBackButton(onBack: () -> Unit) {
    Box(
        modifier = Modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(Color.White.copy(alpha = 0.92f))
            .clickable(onClick = onBack),
        contentAlignment = Alignment.Center,
    ) {
        Image(
            painter = painterResource(R.drawable.ic_back),
            contentDescription = stringResource(R.string.back),
            modifier = Modifier.size(18.dp),
            colorFilter = ColorFilter.tint(colorResource(R.color.stitch_primary)),
        )
    }
}

@Composable
private fun StoreProfileBackBar(title: String, onBack: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        StoreBackButton(onBack = onBack)
        Spacer(Modifier.size(12.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = colorResource(R.color.stitch_primary),
        )
    }
}

@Composable
private fun StoreBadge(text: String) {
    Box(
        modifier = Modifier
            .clip(PillShape)
            .background(colorResource(R.color.secondary_container))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = colorResource(R.color.stitch_primary),
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun StoreInfoChip(label: String) {
    Box(
        modifier = Modifier
            .clip(PillShape)
            .background(colorResource(R.color.surface_container_low))
            .padding(horizontal = 12.dp, vertical = 6.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = colorResource(R.color.on_surface_variant),
            fontWeight = FontWeight.Medium,
        )
    }
}

@Composable
private fun StoreContactRow(
    iconRes: Int,
    text: String,
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(
            painter = painterResource(iconRes),
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            colorFilter = ColorFilter.tint(colorResource(R.color.outline)),
        )
        Spacer(Modifier.size(8.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = colorResource(R.color.on_surface_variant),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun StoreSearchField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val outlineVariant = colorResource(R.color.outline_variant)
    TextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, outlineVariant, PillShape),
        shape = PillShape,
        singleLine = true,
        leadingIcon = {
            Image(
                painter = painterResource(R.drawable.ic_search),
                contentDescription = null,
                modifier = Modifier.size(22.dp),
                colorFilter = ColorFilter.tint(colorResource(R.color.outline)),
            )
        },
        colors = TextFieldDefaults.colors(
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            disabledIndicatorColor = Color.Transparent,
            focusedContainerColor = colorResource(R.color.surface_container_low),
            unfocusedContainerColor = colorResource(R.color.surface_container_low),
        ),
        placeholder = {
            Text(
                text = stringResource(R.string.search_store_products),
                style = MaterialTheme.typography.bodyMedium,
                color = outlineVariant,
            )
        },
    )
}
