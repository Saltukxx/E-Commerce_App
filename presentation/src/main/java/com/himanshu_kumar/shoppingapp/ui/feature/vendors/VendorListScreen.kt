package com.himanshu_kumar.shoppingapp.ui.feature.vendors

import androidx.compose.foundation.Image
import androidx.compose.runtime.remember
import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.shoppingapp.utils.ImageUrlUtils
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.navigateToStoreProfile
import com.himanshu_kumar.shoppingapp.ui.feature.category_list.CategoryTopBar
import org.koin.androidx.compose.koinViewModel

@Composable
fun VendorListScreen(
    navController: NavController,
    viewModel: VendorListViewModel = koinViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Surface(modifier = Modifier.fillMaxSize(), color = Color.White) {
        when (val state = uiState) {
            VendorListUiState.Loading -> {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is VendorListUiState.Error -> {
                Column(Modifier.fillMaxSize()) {
                    CategoryTopBar(
                        title = stringResource(R.string.sellers_title),
                        onBackClick = { navController.popBackStack() },
                        onSearchClick = { },
                        showSearchAction = false,
                    )
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(text = state.message, color = Color.Red)
                            Button(onClick = viewModel::load) {
                                Text(text = stringResource(R.string.retry))
                            }
                        }
                    }
                }
            }
            is VendorListUiState.Success -> {
                Column(Modifier.fillMaxSize()) {
                    CategoryTopBar(
                        title = stringResource(R.string.sellers_title),
                        onBackClick = { navController.popBackStack() },
                        onSearchClick = { },
                        showSearchAction = false,
                    )
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(state.stores, key = { it.id }) { store ->
                            StoreCard(store = store, onClick = {
                                navController.navigateToStoreProfile(store.slug, store.name)
                            })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StoreCard(store: StoreModel, onClick: () -> Unit) {
    val context = LocalContext.current
    val logoRequest = remember(store.logo) {
        if (store.logo.isBlank()) null
        else ImageRequest.Builder(context).data(ImageUrlUtils.resolveImageUrl(store.logo)).crossfade(true).build()
    }
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
    ) {
        Column(Modifier.padding(14.dp)) {
            if (logoRequest != null) {
                AsyncImage(
                    model = logoRequest,
                    contentDescription = store.name,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop,
                )
            }
            if (store.isFeatured) {
                Text(
                    text = stringResource(R.string.featured_seller),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            Text(
                text = store.name,
                style = MaterialTheme.typography.titleMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            if (store.description.isNotBlank()) {
                Text(
                    text = store.description,
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 6.dp),
                )
            }
        }
    }
}
