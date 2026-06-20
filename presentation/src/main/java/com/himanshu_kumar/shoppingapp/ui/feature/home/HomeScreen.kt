package com.himanshu_kumar.shoppingapp.ui.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.TextButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.util.lerp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.HorizontalPager
import com.google.accompanist.pager.HorizontalPagerIndicator
import com.google.accompanist.pager.calculateCurrentOffsetForPage
import com.google.accompanist.pager.rememberPagerState
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.domain.search.CatalogSearch
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.ALL_PRODUCTS_CATEGORY_ID
import com.himanshu_kumar.shoppingapp.navigation.CartScreen
import com.himanshu_kumar.shoppingapp.navigation.CatalogSearchNavArgs
import com.himanshu_kumar.shoppingapp.navigation.CatalogSearchScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryItemsScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryNavArgs
import com.himanshu_kumar.shoppingapp.navigation.MarketScreen as MarketRoute
import com.himanshu_kumar.shoppingapp.navigation.StoreApplicationScreen
import com.himanshu_kumar.shoppingapp.navigation.navigateToStoreProfile
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.navigation.VendorHubScreen
import com.himanshu_kumar.shoppingapp.ui.components.CategoryItem
import com.himanshu_kumar.shoppingapp.ui.components.CompactProductCard
import com.himanshu_kumar.shoppingapp.ui.components.ErrorState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.yield
import org.koin.androidx.compose.koinViewModel
import kotlin.math.absoluteValue

/** Height of the top/mid [BannerSection] pager slides (network-style wide banners). */
private val HomeBannerImageHeight = 114.dp

/**
 * Embraco static hero only: 240dp (1.5× 160dp). Top/mid [BannerSection] carousels use
 * [HomeBannerImageHeight] and are not scaled with this.
 */
private val EmbracoPromoBannerHeight = 240.dp

@Composable
fun HomeScreen(navController: NavController, viewModel: HomeViewModel = koinViewModel()) {
    val allCatalogTitle = stringResource(R.string.all_categories)
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val userDetails by viewModel.userDetails.collectAsStateWithLifecycle()
    val cartItemCount by viewModel.cartItemCount.collectAsStateWithLifecycle()
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val comingSoonMessage = stringResource(R.string.profile_coming_soon)

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(it),
            color = colorResource(R.color.home_background),
        ) {
            HomeContent(
                userDetails = userDetails,
                uiState = uiState,
                cartItemCount = cartItemCount,
                onRetry = viewModel::refresh,
                onProductClick = {
                    navController.navigate(ProductDetails(UiProductModel.fromProduct(it)))
                },
                onStoreClick = { slug, name ->
                    navController.navigateToStoreProfile(slug, name)
                },
                onCartClicked = {
                    navController.navigate(CartScreen)
                },
                onNotificationsClicked = {
                    scope.launch {
                        snackbarHostState.showSnackbar(comingSoonMessage)
                    }
                },
                onCategoryClicked = {
                    navController.currentBackStackEntry?.savedStateHandle?.apply {
                        set(CategoryNavArgs.CATEGORY_ID, it)
                        remove<String>(CategoryNavArgs.CATEGORY_LIST_TITLE)
                    }
                    navController.navigate(CategoryItemsScreen)
                },
                onViewAllCatalog = {
                    navController.currentBackStackEntry?.savedStateHandle?.apply {
                        set(CategoryNavArgs.CATEGORY_ID, ALL_PRODUCTS_CATEGORY_ID)
                        set(CategoryNavArgs.CATEGORY_LIST_TITLE, allCatalogTitle)
                    }
                    navController.navigate(CategoryItemsScreen)
                },
                onViewAllCategory = { categoryId, listTitle ->
                    navController.currentBackStackEntry?.savedStateHandle?.apply {
                        set(CategoryNavArgs.CATEGORY_ID, categoryId)
                        if (listTitle != null) {
                            set(CategoryNavArgs.CATEGORY_LIST_TITLE, listTitle)
                        } else {
                            remove<String>(CategoryNavArgs.CATEGORY_LIST_TITLE)
                        }
                    }
                    navController.navigate(CategoryItemsScreen)
                },
                onSearchFullCatalog = { query ->
                    navController.currentBackStackEntry?.savedStateHandle?.set(
                        CatalogSearchNavArgs.INITIAL_QUERY,
                        query,
                    )
                    navController.navigate(CatalogSearchScreen)
                },
                onOpenMarket = {
                    navController.navigate(MarketRoute) {
                        navController.graph.startDestinationRoute?.let { startRoute ->
                            popUpTo(startRoute) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                onBecomeSeller = { navController.navigate(VendorHubScreen) },
            )
        }
    }
}

@Composable
fun ProfileHeader(
    userDetails: UserDomainModel?,
    cartItemCount: Int = 0,
    onCartClicked: () -> Unit,
    onNotificationsClicked: () -> Unit,
) {
    val context = LocalContext.current
    val avatarRequest = remember(userDetails?.avatar) {
        val url = userDetails?.avatar
        if (url.isNullOrBlank()) {
            null
        } else {
            ImageRequest.Builder(context)
                .data(url)
                .size(144, 144)
                .crossfade(false)
                .build()
        }
    }
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.align(Alignment.CenterStart),
        ) {
            if (avatarRequest != null) {
                AsyncImage(
                    model = avatarRequest,
                    contentDescription = null,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape),
                    contentScale = ContentScale.Crop,
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(colorResource(R.color.surface_container_high)),
                )
            }
            Spacer(Modifier.size(12.dp))
            Column {
                Text(
                    text = stringResource(R.string.hello),
                    style = MaterialTheme.typography.labelSmall,
                    color = colorResource(R.color.on_surface_variant),
                )
                Text(
                    text = userDetails?.name ?: stringResource(R.string.user_fallback),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = colorResource(R.color.stitch_primary),
                )
            }
        }
        Row(
            modifier = Modifier.align(Alignment.CenterEnd),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_notification),
                contentDescription = stringResource(R.string.settings_notifications_title),
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(colorResource(R.color.surface_container))
                    .padding(8.dp)
                    .clickable { onNotificationsClicked() },
                contentScale = ContentScale.Inside,
            )
            Box(contentAlignment = Alignment.TopEnd) {
                Image(
                    painter = painterResource(id = R.drawable.ic_cart),
                    contentDescription = stringResource(R.string.my_cart),
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(colorResource(R.color.surface_container))
                        .padding(8.dp)
                        .clickable { onCartClicked() },
                    contentScale = ContentScale.Inside,
                )
                if (cartItemCount > 0) {
                    Box(
                        modifier = Modifier
                            .size(18.dp)
                            .clip(CircleShape)
                            .background(colorResource(R.color.stitch_primary)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = if (cartItemCount > 99) "99+" else cartItemCount.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HomeContent(
    userDetails: UserDomainModel?,
    uiState: HomeScreenUIEvents,
    cartItemCount: Int = 0,
    onRetry: () -> Unit = {},
    onProductClick: (ProductListModel) -> Unit,
    onCartClicked: () -> Unit,
    onNotificationsClicked: () -> Unit,
    onCategoryClicked: (Int) -> Unit,
    onViewAllCatalog: () -> Unit,
    onViewAllCategory: (Int, String?) -> Unit = { _, _ -> },
    onSearchFullCatalog: (String) -> Unit = {},
    onStoreClick: (String, String) -> Unit = { _, _ -> },
    onOpenMarket: () -> Unit = {},
    onBecomeSeller: () -> Unit = {},
) {
    val searchQuery = remember { mutableStateOf("") }
    val success = uiState as? HomeScreenUIEvents.Success
    val featured = success?.featured ?: emptyList()
    val popularProducts = success?.popularProducts ?: emptyList()
    val categories = success?.categories ?: emptyList()
    val categoryPreviews = success?.categoryPreviews ?: emptyList()
    val embracoCategory = success?.embracoCategory
    val embracoProducts = success?.embracoProducts ?: emptyList()
    val featuredStores = success?.featuredStores ?: emptyList()
    val isLoading = uiState is HomeScreenUIEvents.Loading
    val errorMessages = (uiState as? HomeScreenUIEvents.Error)?.message
    val normalizedQuery = remember(searchQuery.value) {
        CatalogSearch.normalizeQuery(searchQuery.value)
    }

    val featuredFiltered = remember(featured, normalizedQuery) {
        if (normalizedQuery.isEmpty()) featured
        else featured.filter { CatalogSearch.productMatches(it, normalizedQuery) }
    }
    val popularFiltered = remember(popularProducts, normalizedQuery) {
        if (normalizedQuery.isEmpty()) popularProducts
        else popularProducts.filter { CatalogSearch.productMatches(it, normalizedQuery) }
    }
    val categoriesFiltered = remember(categories, normalizedQuery) {
        if (normalizedQuery.isEmpty()) categories
        else categories.filter { CatalogSearch.categoryMatches(it, normalizedQuery) }
    }
    val categoryPreviewsFiltered = remember(categoryPreviews, normalizedQuery) {
        if (normalizedQuery.isEmpty()) {
            categoryPreviews
        } else {
            categoryPreviews
                .map { p ->
                    p.copy(
                        products = p.products.filter {
                            CatalogSearch.productMatches(it, normalizedQuery)
                        },
                    )
                }
                .filter { it.products.isNotEmpty() }
        }
    }
    val embracoFiltered = remember(embracoProducts, normalizedQuery) {
        if (normalizedQuery.isEmpty()) embracoProducts
        else embracoProducts.filter { CatalogSearch.productMatches(it, normalizedQuery) }
    }
    val showBanner =
        !isLoading &&
            (
                categoriesFiltered.isNotEmpty() ||
                    featuredFiltered.isNotEmpty() ||
                    popularFiltered.isNotEmpty() ||
                    categoryPreviewsFiltered.any { it.products.isNotEmpty() } ||
                    embracoFiltered.isNotEmpty()
                )

    LazyColumn {
        item(key = "header") {
            ProfileHeader(userDetails, cartItemCount, onCartClicked, onNotificationsClicked)
            SearchBar(value = searchQuery.value, onTextChanged = { searchQuery.value = it })
            if (success != null &&
                normalizedQuery.length >= CatalogSearch.MIN_SERVER_QUERY_LEN
            ) {
                TextButton(
                    onClick = { onSearchFullCatalog(normalizedQuery) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                ) {
                    Text(
                        text = stringResource(R.string.search_full_catalog),
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            }
        }
        if (normalizedQuery.isEmpty()) {
            item(key = "welcome_hero") {
                Spacer(Modifier.size(16.dp))
                WelcomeHeroSection(
                    onBrowseCatalog = onViewAllCatalog,
                    onOpenMarket = onOpenMarket,
                    onBecomeSeller = onBecomeSeller,
                )
            }
            if (embracoCategory != null) {
                item(key = "top_brands") {
                    Spacer(Modifier.size(32.dp))
                    TopBrandsSection(
                        onClick = {
                            onViewAllCategory(embracoCategory.id, embracoCategory.name)
                        },
                    )
                }
            }
            if (categoriesFiltered.isNotEmpty()) {
                item(key = "popular_categories") {
                    Spacer(Modifier.size(32.dp))
                    PopularCategoriesGrid(
                        categories = categoriesFiltered,
                        onCategoryClick = onCategoryClicked,
                        compressorCategory = embracoCategory,
                    )
                }
            }
            if (featuredStores.isNotEmpty()) {
                item(key = "showcase_stores") {
                    ShowcaseStoresSection(
                        stores = featuredStores,
                        onStoreClick = onStoreClick,
                        onViewAllStores = onOpenMarket,
                    )
                }
            }
        }
        if (isLoading) {
            item(key = "loading") {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(50.dp))
                    Text(
                        text = stringResource(R.string.loading),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        errorMessages?.let { msg ->
            item(key = "error") {
                ErrorState(message = msg, onRetry = onRetry)
            }
        }
        if (showBanner && normalizedQuery.isNotEmpty()) {
            item(key = "banner") {
                Spacer(Modifier.size(16.dp))
                BannerSection(instanceKey = "top")
                Spacer(Modifier.size(16.dp))
            }
        }
        if (featuredFiltered.isNotEmpty()) {
            item(key = "featured") {
                Spacer(Modifier.size(if (normalizedQuery.isEmpty()) 32.dp else 16.dp))
                HomeProductRow(
                    products = featuredFiltered,
                    title = stringResource(R.string.featured_products),
                    onClick = onProductClick,
                    onViewAll = onViewAllCatalog,
                    onStoreClick = onStoreClick,
                )
                Spacer(Modifier.size(16.dp))
            }
        }
        if (popularFiltered.isNotEmpty()) {
            item(key = "popular") {
                HomeProductRecommendedRow(
                    products = popularFiltered,
                    title = stringResource(R.string.recommended),
                    onClick = onProductClick,
                    onViewAll = onViewAllCatalog,
                    onStoreClick = onStoreClick,
                )
                Spacer(Modifier.size(16.dp))
            }
        }
        if (showBanner && normalizedQuery.isNotEmpty()) {
            item(key = "banner2") {
                BannerSection(instanceKey = "mid")
                Spacer(Modifier.size(16.dp))
            }
        }
        if (categoriesFiltered.isNotEmpty() && normalizedQuery.isNotEmpty()) {
            item(key = "categories") {
                CategorySection(categoriesFiltered) {
                    onCategoryClicked(it)
                }
                Spacer(Modifier.size(16.dp))
            }
        }
        items(
            items = categoryPreviewsFiltered.filter { it.products.isNotEmpty() },
            key = { it.category.id },
        ) { preview ->
            HomeProductRow(
                products = preview.products,
                title = preview.category.name,
                onClick = onProductClick,
                onViewAll = {
                    onViewAllCategory(
                        preview.category.id,
                        preview.category.name,
                    )
                },
                onStoreClick = onStoreClick,
            )
            Spacer(Modifier.size(16.dp))
        }
        if (embracoCategory != null && embracoFiltered.isNotEmpty() && normalizedQuery.isEmpty()) {
            item(key = "embraco") {
                Spacer(Modifier.size(32.dp))
                HomeProductRow(
                    products = embracoFiltered,
                    title = embracoCategory.name,
                    onClick = onProductClick,
                    onViewAll = {
                        onViewAllCategory(embracoCategory.id, embracoCategory.name)
                    },
                    onStoreClick = onStoreClick,
                )
            }
        }
    }
}

@OptIn(ExperimentalPagerApi::class)
@Composable
fun BannerSection(
    instanceKey: String,
    bannerDrawableIds: List<Int> = listOf(
        R.drawable.banner1,
        R.drawable.banner2,
        R.drawable.banner3,
    ),
) {
    val pagerState = rememberPagerState(initialPage = 0)
    val bannerImages = bannerDrawableIds.map { painterResource(it) }

    LaunchedEffect(instanceKey) {
        while (true) {
            yield()
            delay(3200)
            if (pagerState.pageCount > 0) {
                pagerState.animateScrollToPage(
                    page = (pagerState.currentPage + 1) % pagerState.pageCount,
                )
            }
        }
    }
    Column {
        HorizontalPager(
            count = bannerImages.size,
            state = pagerState,
            contentPadding = PaddingValues(horizontal = 16.dp),
            modifier = Modifier
                .height(HomeBannerImageHeight)
                .fillMaxWidth(),
        ) { page ->
            Card(
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .graphicsLayer {
                        val pageOffset = calculateCurrentOffsetForPage(page).absoluteValue
                        lerp(
                            start = 0.85f,
                            stop = 1f,
                            fraction = 1f - pageOffset.coerceIn(0f, 1f),
                        ).also { scale ->
                            scaleX = scale
                            scaleY = scale
                        }

                        alpha = lerp(
                            start = 0.5f,
                            stop = 1f,
                            fraction = 1f - pageOffset.coerceIn(0f, 1f),
                        )
                    },
            ) {
                Image(
                    painter = bannerImages[page],
                    contentDescription = stringResource(R.string.image_slider),
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
        HorizontalPagerIndicator(
            pagerState = pagerState,
            modifier = Modifier
                .align(Alignment.CenterHorizontally)
                .padding(16.dp),
        )
    }
}

@Composable
private fun EmbracoPromoSection(
    category: CategoriesListModel,
    products: List<ProductListModel>,
    onProductClick: (ProductListModel) -> Unit,
    onViewAll: () -> Unit,
    onStoreClick: (String, String) -> Unit = { _, _ -> },
) {
    Column {
        Card(
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .height(EmbracoPromoBannerHeight),
        ) {
            Image(
                painter = painterResource(R.drawable.embraco_home_promo),
                contentDescription = category.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }
        Spacer(Modifier.size(12.dp))
        HomeProductRow(
            products = products,
            title = category.name,
            onClick = onProductClick,
            onViewAll = onViewAll,
            onStoreClick = onStoreClick,
        )
    }
}

@Composable
fun CategorySection(
    categories: List<CategoriesListModel>,
    onClick: (Int) -> Unit,
) {
    Column {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
        ) {
            Text(
                text = stringResource(R.string.categories),
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.SemiBold,
                ),
                modifier = Modifier.align(Alignment.CenterStart),
            )
        }

        val tilePalette = rememberCategoryTilePalette()

        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(categories, key = { it.id }) { category ->
                CategoryItem(
                    category = category,
                    tilePalette = tilePalette,
                    onClick = { onClick(category.id) },
                )
            }
        }
    }
}

@Composable
private fun rememberCategoryTilePalette(): List<Color> {
    val c0 = colorResource(R.color.category_tile_0)
    val c1 = colorResource(R.color.category_tile_1)
    val c2 = colorResource(R.color.category_tile_2)
    val c3 = colorResource(R.color.category_tile_3)
    val c4 = colorResource(R.color.category_tile_4)
    val c5 = colorResource(R.color.category_tile_5)
    return remember(c0, c1, c2, c3, c4, c5) {
        listOf(c0, c1, c2, c3, c4, c5)
    }
}

@Composable
fun SearchBar(value: String, onTextChanged: (String) -> Unit) {
    val outlineVariant = colorResource(R.color.outline_variant)
    TextField(
        value = value,
        onValueChange = onTextChanged,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 16.dp)
            .border(1.dp, outlineVariant, RoundedCornerShape(100.dp)),
        shape = RoundedCornerShape(100.dp),
        leadingIcon = {
            Image(
                painter = painterResource(R.drawable.ic_search),
                contentDescription = null,
                modifier = Modifier.size(22.dp),
                colorFilter = androidx.compose.ui.graphics.ColorFilter.tint(
                    colorResource(R.color.outline),
                ),
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
                text = stringResource(R.string.search_products),
                style = MaterialTheme.typography.bodyMedium,
                color = outlineVariant,
            )
        },
    )
}

@Composable
fun HomeProductRow(
    products: List<ProductListModel>,
    title: String,
    onClick: (ProductListModel) -> Unit,
    onViewAll: () -> Unit = {},
    onStoreClick: (String, String) -> Unit = { _, _ -> },
) {
    Column {
        Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(
                    Alignment.CenterStart,
                ),
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .clickable { onViewAll() },
                text = stringResource(R.string.view_all),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        Spacer(Modifier.size(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            items(products, key = { it.id }) { product ->
                CompactProductCard(
                    product,
                    onClick = onClick,
                    onStoreClick = onStoreClick,
                )
            }
        }
    }
}

@Composable
fun HomeProductRecommendedRow(
    products: List<ProductListModel>,
    title: String,
    onClick: (ProductListModel) -> Unit,
    onViewAll: () -> Unit = {},
    onStoreClick: (String, String) -> Unit = { _, _ -> },
) {
    Column {
        Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(
                    Alignment.CenterStart,
                ),
                fontWeight = FontWeight.SemiBold,
            )
            Text(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .clickable { onViewAll() },
                text = stringResource(R.string.view_all),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        Spacer(Modifier.size(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            items(products, key = { it.id }) { product ->
                CompactProductCard(
                    product,
                    onClick = onClick,
                    onStoreClick = onStoreClick,
                )
            }
        }
    }
}
