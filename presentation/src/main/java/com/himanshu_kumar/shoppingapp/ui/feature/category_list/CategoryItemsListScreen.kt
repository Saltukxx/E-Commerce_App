package com.himanshu_kumar.shoppingapp.ui.feature.category_list

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.ui.components.ProductListCard
import org.koin.androidx.compose.koinViewModel

@Composable
fun CategoryItemsListScreen(
    navController: NavController,
    category: Int,
    listTitle: String? = null,
    viewModel: CategoryItemsListViewModel = koinViewModel()
) {
    val uiState = viewModel.uiState.collectAsState()
    var searchOpen by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }

    LaunchedEffect(category) {
        viewModel.getProductsWithCategory(category)
    }

    when (val state = uiState.value) {
        is CategoryItemsListUIEvents.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator()
                Spacer(Modifier.size(5.dp))
                Text(
                    text = stringResource(R.string.loading),
                    style = MaterialTheme.typography.headlineMedium
                )
            }
        }
        is CategoryItemsListUIEvents.Error -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(text = state.message, color = Color.Red)
            }
        }
        is CategoryItemsListUIEvents.Success -> {
            val listState = rememberLazyListState()
            val resolvedTitle = listTitle
                ?: state.data.firstOrNull()?.category?.name
                ?: stringResource(R.string.category_fallback)
            val filtered = remember(state.data, searchQuery) {
                if (searchQuery.isBlank()) state.data
                else state.data.filter {
                    it.title.contains(searchQuery, ignoreCase = true)
                }
            }
            LaunchedEffect(searchQuery, listState, state.hasMore, state.isLoadingMore) {
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
                        val cur = viewModel.uiState.value
                        if (cur is CategoryItemsListUIEvents.Success &&
                            cur.hasMore &&
                            !cur.isLoadingMore
                        ) {
                            viewModel.loadNextPage()
                        }
                    }
            }
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                CategoryTopBar(
                    title = resolvedTitle,
                    onBackClick = { navController.popBackStack() },
                    onSearchClick = {
                        searchOpen = !searchOpen
                        if (!searchOpen) searchQuery = ""
                    }
                )
                if (searchOpen) {
                    Spacer(modifier = Modifier.height(8.dp))
                    TextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        placeholder = {
                            Text(
                                stringResource(R.string.search_products),
                                style = MaterialTheme.typography.bodySmall
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
                }
                Spacer(modifier = Modifier.height(16.dp))

                if (filtered.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(text = stringResource(R.string.no_products))
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(filtered, key = { it.id }) { item ->
                            ProductListCard(
                                product = item,
                                onClick = {
                                    navController.navigate(ProductDetails(UiProductModel.fromProduct(item)))
                                }
                            )
                        }
                        if (searchQuery.isBlank()) {
                            item(key = "pagination_footer") {
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
}

@Composable
fun CategoryTopBar(
    title: String,
    onBackClick: () -> Unit,
    onSearchClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_back),
            contentDescription = stringResource(R.string.back),
            modifier = Modifier
                .size(25.dp)
                .clickable { onBackClick() }
        )
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 8.dp),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        Image(
            painter = painterResource(id = R.drawable.ic_search),
            contentDescription = stringResource(R.string.search),
            modifier = Modifier
                .size(25.dp)
                .clickable { onSearchClick() }
        )
    }
}
