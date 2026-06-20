package com.himanshu_kumar.shoppingapp.ui.feature.market

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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.TextButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.ALL_PRODUCTS_CATEGORY_ID
import com.himanshu_kumar.shoppingapp.navigation.CategoryItemsScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryNavArgs
import com.himanshu_kumar.shoppingapp.navigation.navigateToStoreProfile
import com.himanshu_kumar.shoppingapp.ui.components.CategoryItem
import org.koin.androidx.compose.koinViewModel

@Composable
fun MarketScreen(
    navController: NavController,
    viewModel: MarketViewModel = koinViewModel(),
) {
    val uiState = viewModel.uiState.collectAsStateWithLifecycle().value
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color.White,
    ) {
        when (val state = uiState) {
            is MarketUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator()
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = stringResource(R.string.loading),
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
            }
            is MarketUiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            text = state.message,
                            color = Color.Red,
                        )
                        Spacer(Modifier.height(8.dp))
                        TextButton(onClick = viewModel::loadCategories) {
                            Text(text = stringResource(R.string.retry))
                        }
                    }
                }
            }
            is MarketUiState.Success -> {
                MarketContent(
                    categories = state.categories,
                    stores = state.stores,
                    onOpenList = { categoryId, listTitle ->
                        navigateToCategoryProductList(navController, categoryId, listTitle)
                    },
                    onOpenAllSellers = {
                        navController.navigate(com.himanshu_kumar.shoppingapp.navigation.VendorListScreen)
                    },
                    onOpenStore = { slug, name ->
                        navController.navigateToStoreProfile(slug, name)
                    },
                )
            }
        }
    }
}

private fun navigateToCategoryProductList(
    navController: NavController,
    categoryId: Int,
    listTitle: String?,
) {
    navController.currentBackStackEntry?.savedStateHandle?.apply {
        set(CategoryNavArgs.CATEGORY_ID, categoryId)
        if (listTitle != null) {
            set(CategoryNavArgs.CATEGORY_LIST_TITLE, listTitle)
        } else {
            remove<String>(CategoryNavArgs.CATEGORY_LIST_TITLE)
        }
        remove<String>(CategoryNavArgs.STORE_SLUG)
    }
    navController.navigate(CategoryItemsScreen)
}

@Composable
private fun MarketContent(
    categories: List<CategoriesListModel>,
    stores: List<StoreModel>,
    onOpenList: (categoryId: Int, listTitle: String?) -> Unit,
    onOpenAllSellers: () -> Unit,
    onOpenStore: (slug: String, name: String) -> Unit,
) {
    val featuredStores = remember(stores) {
        val featured = stores.filter { it.isFeatured }
        (if (featured.isNotEmpty()) featured else stores).take(2)
    }
    val tilePalette = rememberCategoryMarketPalette()
    val allProductsLabel = stringResource(R.string.all_categories)
    val allProductsStub = remember(allProductsLabel) {
        CategoriesListModel(
            creationAt = "",
            id = -1,
            image = "",
            name = allProductsLabel,
            slug = "all-products",
            updatedAt = "",
        )
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = stringResource(R.string.market_title),
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
            modifier = Modifier
                .padding(horizontal = 16.dp, vertical = 16.dp),
        )
        if (stores.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(R.string.sellers_title),
                    style = MaterialTheme.typography.titleMedium,
                )
                TextButton(onClick = onOpenAllSellers) {
                    Text(text = stringResource(R.string.view_all))
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                featuredStores.forEach { store ->
                    CategoryItem(
                        category = CategoriesListModel(
                            creationAt = "",
                            id = store.id,
                            image = store.logo,
                            name = store.name,
                            slug = store.slug,
                            updatedAt = "",
                        ),
                        tilePalette = tilePalette,
                        modifier = Modifier.weight(1f),
                        onClick = { onOpenStore(store.slug, store.name) },
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.categories),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            )
        }
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                CategoryItem(
                    category = allProductsStub,
                    tilePalette = tilePalette,
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        onOpenList(ALL_PRODUCTS_CATEGORY_ID, allProductsLabel)
                    },
                )
            }
            items(
                items = categories,
                key = { it.id },
            ) { category ->
                CategoryItem(
                    category = category,
                    tilePalette = tilePalette,
                    modifier = Modifier.fillMaxWidth(),
                    onClick = {
                        onOpenList(category.id, category.name)
                    },
                )
            }
        }
    }
}

@Composable
private fun rememberCategoryMarketPalette(): List<Color> {
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
