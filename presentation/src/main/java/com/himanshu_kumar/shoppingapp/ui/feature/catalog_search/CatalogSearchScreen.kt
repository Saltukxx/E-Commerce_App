package com.himanshu_kumar.shoppingapp.ui.feature.catalog_search

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.himanshu_kumar.domain.search.CatalogSearch
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.navigateToStoreProfile
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.ui.components.ProductListCard
import com.himanshu_kumar.shoppingapp.ui.feature.category_list.CategoryTopBar
import org.koin.androidx.compose.koinViewModel

@Composable
fun CatalogSearchScreen(
    navController: NavController,
    initialQuery: String,
    viewModel: SearchCatalogViewModel = koinViewModel(),
) {
    var queryText by remember(initialQuery) { mutableStateOf(initialQuery) }
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(queryText) {
        delay(320)
        viewModel.onDebouncedQuery(queryText)
    }

    LaunchedEffect(initialQuery) {
        if (CatalogSearch.normalizeQuery(queryText) != CatalogSearch.normalizeQuery(initialQuery)) {
            queryText = initialQuery
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 16.dp),
    ) {
        CategoryTopBar(
            title = stringResource(R.string.search_catalog_title),
            onBackClick = { navController.popBackStack() },
            onSearchClick = {},
            showSearchAction = false,
        )
        Spacer(Modifier.height(8.dp))
        TextField(
            value = queryText,
            onValueChange = { queryText = it },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            placeholder = {
                Text(
                    stringResource(R.string.search_products),
                    style = MaterialTheme.typography.bodySmall,
                )
            },
            singleLine = true,
            colors = TextFieldDefaults.colors(
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedContainerColor = Color.LightGray.copy(alpha = 0.25f),
                unfocusedContainerColor = Color.LightGray.copy(alpha = 0.25f),
            ),
        )
        Spacer(Modifier.height(16.dp))

        when (val state = uiState) {
            SearchCatalogUiState.Prompt -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = stringResource(R.string.search_min_chars_hint),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            SearchCatalogUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }

            is SearchCatalogUiState.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(text = state.message, color = Color.Red)
                }
            }

            is SearchCatalogUiState.Success -> {
                val listState = rememberLazyListState()
                LaunchedEffect(listState, state.hasMore, state.isLoadingMore) {
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
                            val cur = viewModel.uiState.value
                            if (cur is SearchCatalogUiState.Success &&
                                cur.hasMore &&
                                !cur.isLoadingMore
                            ) {
                                viewModel.loadNextPage()
                            }
                        }
                }

                if (state.data.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = stringResource(R.string.no_search_matches),
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(state.data, key = { it.id }) { item ->
                            ProductListCard(
                                product = item,
                                onClick = {
                                    navController.navigate(ProductDetails(UiProductModel.fromProduct(item)))
                                },
                                onStoreClick = { slug, name ->
                                    navController.navigateToStoreProfile(slug, name)
                                },
                            )
                        }
                        item(key = "search_footer") {
                            when {
                                state.isLoadingMore -> {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        CircularProgressIndicator()
                                    }
                                }

                                state.loadMoreError != null -> {
                                    Text(
                                        text = state.loadMoreError,
                                        color = Color.Red,
                                        style = MaterialTheme.typography.bodySmall,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp)
                                            .clickable { viewModel.loadNextPage() },
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
