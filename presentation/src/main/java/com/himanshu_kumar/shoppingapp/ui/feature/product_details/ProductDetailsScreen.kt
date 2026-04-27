package com.himanshu_kumar.shoppingapp.ui.feature.product_details

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.HorizontalPager
import com.google.accompanist.pager.HorizontalPagerIndicator
import com.google.accompanist.pager.rememberPagerState
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.CartSummaryScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryItemsScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryNavArgs
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.utils.CurrencyUtils
import com.himanshu_kumar.shoppingapp.ui.components.CompactProductCard
import org.koin.androidx.compose.koinViewModel
@OptIn(ExperimentalPagerApi::class)
@Composable
fun ProductDetailsScreen(
    navController: NavController,
    product: UiProductModel,
    viewModel: ProductDetailsViewModel = koinViewModel()
) {
    val uiState = viewModel.state.collectAsState()
    val loading = remember { mutableStateOf(false) }
    val context = LocalContext.current
    LaunchedEffect(product.categoryId) {
        viewModel.getSimilarProducts(product.categoryId)
    }
    LaunchedEffect(product.id, viewModel.userId) {
        if (viewModel.userId != 0) {
            viewModel.refreshWishlistIds()
        }
    }

    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        // MAIN CONTENT
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 12.dp)
        ) {
            item {
                // 🖼️ Image slider
                val pagerState = rememberPagerState()
                Box(
                    modifier = Modifier
                        .height(300.dp)
                        .fillMaxWidth()
                ) {
                    if (product.images.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.LightGray.copy(alpha = 0.3f)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(text = stringResource(R.string.product_image))
                        }
                    } else {
                        HorizontalPager(
                            count = product.images.size,
                            state = pagerState,
                            modifier = Modifier.fillMaxSize()
                        ) { page ->
                            AsyncImage(
                                model = product.images[page],
                                contentDescription = stringResource(R.string.product_image),
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }

                    // Pager indicator (small dots at bottom center)
                    if (product.images.size > 1) {
                        HorizontalPagerIndicator(
                            pagerState = pagerState,
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(16.dp)
                        )
                    }

                    // Back Button
                    Image(
                        painter = painterResource(id = R.drawable.ic_back),
                        contentDescription = stringResource(R.string.back),
                        modifier = Modifier
                            .padding(16.dp)
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .padding(8.dp)
                            .align(Alignment.TopStart)
                            .clickable {
                                if (!navController.popBackStack()) {
                                    navController.navigateUp()
                                }
                            }
                    )

                    // Favorite Button
                    val wishlistIds = viewModel.wishlistedProductIds.collectAsState()
                    val isFavorite = product.id in wishlistIds.value
                    Image(
                        painter = painterResource(id = R.drawable.ic_favorite),
                        contentDescription = stringResource(R.string.favorite),
                        colorFilter = ColorFilter.tint(
                            if (isFavorite) Color.Red else Color.Black.copy(alpha = 0.4f)
                        ),
                        modifier = Modifier
                            .padding(16.dp)
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .padding(8.dp)
                            .align(Alignment.TopEnd)
                            .clickable { viewModel.toggleWishlist(product) }
                    )
                }
            }

            item {
                // 📝 Product Details
                ProductDetailsContent(product = product, viewModel = viewModel)
            }

            item {
                val similarProducts = viewModel.similarProducts.collectAsState()
                SimilarProducts(
                    products = similarProducts.value.filter { it.id != product.id },
                    onProductClick = { clickedProduct ->
                        navController.navigate(ProductDetails(UiProductModel.fromProduct(clickedProduct)))
                    },
                    onViewAll = {
                        navController.currentBackStackEntry?.savedStateHandle?.apply {
                            set(CategoryNavArgs.CATEGORY_ID, product.categoryId)
                            remove<String>(CategoryNavArgs.CATEGORY_LIST_TITLE)
                        }
                        navController.navigate(CategoryItemsScreen)
                    },
                )
            }
        }

        // LOADING Overlay
        if (loading.value) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.7f)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.size(8.dp))
                    Text(
                        text = stringResource(R.string.adding_to_cart),
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White
                    )
                }
            }
        }
    }

    // EFFECT for API Result
    LaunchedEffect(uiState.value) {
        when (val s = uiState.value) {
            is ProductDetailsState.Success -> {
                loading.value = false
                if (s.navigateToCheckout) {
                    navController.navigate(CartSummaryScreen)
                } else {
                    Toast.makeText(context, s.message, Toast.LENGTH_SHORT).show()
                }
                viewModel.acknowledgeState()
            }

            is ProductDetailsState.Error -> {
                loading.value = false
                Toast.makeText(context, s.message, Toast.LENGTH_SHORT).show()
                viewModel.acknowledgeState()
            }

            is ProductDetailsState.Loading -> loading.value = true
            else -> loading.value = false
        }
    }
}

@Composable
fun SimilarProducts(
    products:List<ProductListModel>,
    onProductClick: (ProductListModel) -> Unit,
    onViewAll: () -> Unit = {},
){
    Column {
        Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            Text(
                text = stringResource(R.string.similar_products),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(
                    Alignment.CenterStart
                ),
                fontWeight = FontWeight.SemiBold
            )
            Text(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .clickable { onViewAll() },
                text = stringResource(R.string.view_all),
                style = MaterialTheme.typography.bodyMedium,
                color =  MaterialTheme.colorScheme.primary
            )
        }
        Spacer(Modifier.size(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            items(products, key = {it.id}){ product ->
                val isVisible = remember { mutableStateOf(false) }
                LaunchedEffect(true) {
                    isVisible.value = true
                }
                AnimatedVisibility(visible = isVisible.value, enter = fadeIn() + expandVertically()) {
                    CompactProductCard(
                        product,
                        onClick = onProductClick
                    )
                }
            }
        }
    }
}
@Composable
fun ProductDetailsContent(product: UiProductModel, viewModel: ProductDetailsViewModel) {
    Column(modifier = Modifier.padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = product.title,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                modifier = Modifier.weight(1f)
            )
            Text(
                text = CurrencyUtils.formatPrice(product.price),
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }
        Spacer(Modifier.height(16.dp))
        Text(stringResource(R.string.description), style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text(product.description, style = MaterialTheme.typography.bodySmall)

        Spacer(Modifier.height(24.dp))
        Row(
            modifier = Modifier.fillMaxWidth()
        ) {
            Button(
                onClick = { viewModel.addProductToCart(product, navigateToCheckout = true) },
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(8.dp)),
                colors = ButtonDefaults.buttonColors(containerColor = colorResource(R.color.button_color))
            ) {
                Text(stringResource(R.string.buy_now))
            }
            Spacer(Modifier.width(8.dp))
            IconButton(
                onClick = { viewModel.addProductToCart(product, navigateToCheckout = false) },
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_order),
                    contentDescription = stringResource(R.string.add_to_cart)
                )
            }
        }
    }
}
