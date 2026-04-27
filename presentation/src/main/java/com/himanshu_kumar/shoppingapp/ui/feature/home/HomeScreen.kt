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
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
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
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.ALL_PRODUCTS_CATEGORY_ID
import com.himanshu_kumar.shoppingapp.navigation.CartScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryItemsScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryNavArgs
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.ui.components.CompactProductCard
import kotlinx.coroutines.delay
import kotlinx.coroutines.yield
import org.koin.androidx.compose.koinViewModel
import kotlin.math.absoluteValue

@Composable
fun HomeScreen(navController: NavController, viewModel: HomeViewModel = koinViewModel()) {
    val allCatalogTitle = stringResource(R.string.all_categories)
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val userDetails by viewModel.userDetails.collectAsStateWithLifecycle()

    Scaffold {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(it),
            color = Color.White,
        ) {
            HomeContent(
                userDetails = userDetails,
                uiState = uiState,
                onProductClick = {
                    navController.navigate(ProductDetails(UiProductModel.fromProduct(it)))
                },
                onCartClicked = {
                    navController.navigate(CartScreen)
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
            )
        }
    }
}

@Composable
fun ProfileHeader(userDetails: UserDomainModel?, onCartClicked: () -> Unit) {
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
            .padding(horizontal = 8.dp, vertical = 16.dp),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.align(Alignment.CenterStart),
        ) {
            if (avatarRequest != null) {
                AsyncImage(
                    model = avatarRequest,
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    contentScale = ContentScale.Crop,
                )
            } else {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color.LightGray.copy(alpha = 0.35f)),
                )
            }
            Spacer(Modifier.size(8.dp))
            Column {
                Text(
                    text = stringResource(R.string.hello),
                    style = MaterialTheme.typography.bodySmall,
                )
                Text(
                    text = userDetails?.name ?: stringResource(R.string.user_fallback),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
        Row(
            modifier = Modifier.align(Alignment.CenterEnd),
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_notification),
                contentDescription = null,
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color.LightGray.copy(alpha = 0.3f))
                    .padding(8.dp),
                contentScale = ContentScale.Inside,
            )
            Spacer(Modifier.size(5.dp))
            Image(
                painter = painterResource(id = R.drawable.ic_cart),
                contentDescription = null,
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color.LightGray.copy(alpha = 0.3f))
                    .padding(8.dp)
                    .clickable {
                        onCartClicked()
                    },
                contentScale = ContentScale.Inside,
            )
        }
    }
}

@Composable
fun HomeContent(
    userDetails: UserDomainModel?,
    uiState: HomeScreenUIEvents,
    onProductClick: (ProductListModel) -> Unit,
    onCartClicked: () -> Unit,
    onCategoryClicked: (Int) -> Unit,
    onViewAllCatalog: () -> Unit,
) {
    val searchQuery = remember { mutableStateOf("") }
    val (featured, popularProducts, categories) = when (val s = uiState) {
        is HomeScreenUIEvents.Success ->
            Triple(s.featured, s.popularProducts, s.categories)
        else -> Triple(emptyList(), emptyList(), emptyList())
    }
    val isLoading = uiState is HomeScreenUIEvents.Loading
    val errorMessages = (uiState as? HomeScreenUIEvents.Error)?.message

    val featuredFiltered = remember(featured, searchQuery.value) {
        if (searchQuery.value.isBlank()) {
            featured
        } else {
            featured.filter { it.title.contains(searchQuery.value, ignoreCase = true) }
        }
    }
    val popularFiltered = remember(popularProducts, searchQuery.value) {
        if (searchQuery.value.isBlank()) {
            popularProducts
        } else {
            popularProducts.filter { it.title.contains(searchQuery.value, ignoreCase = true) }
        }
    }
    val categoriesFiltered = remember(categories, searchQuery.value) {
        if (searchQuery.value.isBlank()) {
            categories
        } else {
            categories.filter { it.name.contains(searchQuery.value, ignoreCase = true) }
        }
    }
    val showBanner =
        !isLoading &&
            (categoriesFiltered.isNotEmpty() || featuredFiltered.isNotEmpty() || popularFiltered.isNotEmpty())

    LazyColumn {
        item(key = "header") {
            ProfileHeader(userDetails, onCartClicked)
            Spacer(Modifier.size(16.dp))
            SearchBar(value = searchQuery.value, onTextChanged = { searchQuery.value = it })
            Spacer(Modifier.size(16.dp))
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
                Text(text = msg, style = MaterialTheme.typography.bodyMedium)
            }
        }
        if (showBanner) {
            item(key = "banner") {
                BannerSection()
                Spacer(Modifier.size(16.dp))
            }
        }
        if (featuredFiltered.isNotEmpty()) {
            item(key = "featured") {
                HomeProductRow(
                    products = featuredFiltered,
                    title = stringResource(R.string.featured_products),
                    onClick = onProductClick,
                    onViewAll = onViewAllCatalog,
                )
                Spacer(Modifier.size(16.dp))
            }
        }
        if (categoriesFiltered.isNotEmpty()) {
            item(key = "categories") {
                CategorySection(categoriesFiltered) {
                    onCategoryClicked(it)
                }
            }
        }
        if (popularFiltered.isNotEmpty()) {
            item(key = "popular") {
                HomeProductRecommendedRow(
                    products = popularFiltered,
                    title = stringResource(R.string.recommended),
                    onClick = onProductClick,
                    onViewAll = onViewAllCatalog,
                )
            }
        }
    }
}

@OptIn(ExperimentalPagerApi::class)
@Composable
fun BannerSection() {
    val pagerState = rememberPagerState(initialPage = 0)
    val bannerImages = listOf(
        painterResource(R.drawable.banner1),
        painterResource(R.drawable.banner3),
        painterResource(R.drawable.banner2),
    )

    LaunchedEffect(Unit) {
        while (true) {
            yield()
            delay(3200)
            pagerState.animateScrollToPage(
                page = (pagerState.currentPage + 1) % (pagerState.pageCount),
            )
        }
    }
    Column {
        HorizontalPager(
            count = bannerImages.size,
            state = pagerState,
            contentPadding = PaddingValues(horizontal = 16.dp),
            modifier = Modifier
                .height(114.dp)
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
fun CategorySection(
    categories: List<CategoriesListModel>,
    onClick: (Int) -> Unit,
) {
    Column(
        modifier = Modifier.height(100.dp),
    ) {
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

        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(categories, key = { it.id }) { category ->
                CategoryItem(
                    category = category,
                    onClick = { onClick(category.id) },
                )
            }
        }
    }
}

@Composable
fun CategoryItem(
    category: CategoriesListModel,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val context = LocalContext.current
    val imageModel = remember(category.image) {
        if (category.image.isBlank()) {
            null
        } else {
            ImageRequest.Builder(context)
                .data(category.image)
                .size(128, 128)
                .crossfade(false)
                .build()
        }
    }
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(Color.LightGray.copy(alpha = 0.3f))
            .clickable { onClick() }
            .padding(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        if (imageModel != null) {
            AsyncImage(
                model = imageModel,
                contentDescription = null,
                modifier = Modifier.size(65.dp),
            )
        } else {
            Box(
                modifier = Modifier
                    .size(65.dp)
                    .background(Color.LightGray.copy(alpha = 0.25f)),
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = category.name,
            style = MaterialTheme.typography.labelMedium,
            maxLines = 1,
        )
    }
}

@Composable
fun SearchBar(value: String, onTextChanged: (String) -> Unit) {
    TextField(
        value = value,
        onValueChange = onTextChanged,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        leadingIcon = {
            Image(
                painter = painterResource(R.drawable.ic_search),
                contentDescription = null,
                modifier = Modifier.size(24.dp),
            )
        },
        colors = TextFieldDefaults.colors(
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            focusedContainerColor = Color.LightGray.copy(alpha = 0.3f),
            unfocusedContainerColor = Color.LightGray.copy(alpha = 0.3f),
        ),
        placeholder = {
            Text(
                text = stringResource(R.string.search_products),
                style = MaterialTheme.typography.bodySmall,
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
                )
            }
        }
    }
}
