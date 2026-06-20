package com.himanshu_kumar.shoppingapp.ui.feature.orders

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.himanshu_kumar.domain.model.OrderGroupModel
import com.himanshu_kumar.domain.model.OrdersData
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.utils.OrderStatusLabels
import com.himanshu_kumar.shoppingapp.navigation.HomeScreen
import com.himanshu_kumar.shoppingapp.navigation.OrderDetailRoute
import com.himanshu_kumar.shoppingapp.navigation.toNavOrderDetail
import com.himanshu_kumar.shoppingapp.utils.CurrencyUtils
import kotlinx.coroutines.delay
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    navController: NavController,
    viewModel: OrdersViewModel = koinViewModel(),
) {
    val uiState by viewModel.orderState.collectAsStateWithLifecycle()
    var selectedTabIndex by remember { mutableIntStateOf(0) }

    val tabTitles = listOf(
        stringResource(R.string.tab_all),
        stringResource(R.string.tab_pending),
        stringResource(R.string.tab_completed),
        stringResource(R.string.tab_cancelled),
    )

    val filteredGroups = remember(uiState, selectedTabIndex) {
        val groups = when (val s = uiState) {
            is OrderEvent.Success -> s.data
            else -> emptyList()
        }
        when (selectedTabIndex) {
            0 -> groups
            1 -> groups.filter { g -> g.orders.any { it.status == "Pending" } }
            2 -> groups.filter { g -> g.orders.any { it.status == "Delivered" } }
            3 -> groups.filter { g -> g.orders.any { it.status == "Cancelled" } }
            else -> groups
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.my_orders),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.SemiBold,
                    )
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface,
                ),
            )
        },
        containerColor = MaterialTheme.colorScheme.background,
    ) { padding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            color = Color.White,
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                ScrollableTabRow(
                    selectedTabIndex = selectedTabIndex,
                    edgePadding = 16.dp,
                    containerColor = Color.White,
                    contentColor = MaterialTheme.colorScheme.primary,
                    divider = {},
                ) {
                    tabTitles.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTabIndex == index,
                            onClick = { selectedTabIndex = index },
                            text = {
                                Text(
                                    text = title,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    style = MaterialTheme.typography.labelLarge,
                                )
                            },
                            selectedContentColor = MaterialTheme.colorScheme.primary,
                            unselectedContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    when (val state = uiState) {
                    is OrderEvent.Loading -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                        ) {
                            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = stringResource(R.string.loading),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }

                    is OrderEvent.Error -> {
                        OrdersErrorContent(
                            rawMessage = state.errorMsg,
                            onRetry = { viewModel.retry() },
                        )
                    }

                    is OrderEvent.Success -> {
                        OrdersSuccessContent(
                            groups = filteredGroups,
                            navController = navController,
                            onRefresh = { viewModel.refresh() },
                        )
                    }
                    }
                }
            }
        }
    }
}

@Composable
private fun OrdersErrorContent(
    rawMessage: String,
    onRetry: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            text = stringResource(R.string.orders_load_failed),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface,
        )
        if (rawMessage.isNotBlank()) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = rawMessage.take(160),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Spacer(modifier = Modifier.height(24.dp))
        FilledTonalButton(onClick = onRetry) {
            Text(stringResource(R.string.retry))
        }
    }
}

@Composable
private fun OrdersEmptyState(
    onContinueShopping: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val scheme = MaterialTheme.colorScheme
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = colorResource(R.color.navy_light),
            shadowElevation = 0.dp,
            tonalElevation = 0.dp,
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Image(
                    painter = painterResource(R.drawable.ic_order),
                    contentDescription = null,
                    modifier = Modifier.size(48.dp),
                    contentScale = ContentScale.Fit,
                    colorFilter = ColorFilter.tint(scheme.primary),
                )
                Spacer(modifier = Modifier.height(20.dp))
                Text(
                    text = stringResource(R.string.no_orders),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = scheme.onSurface,
                    textAlign = TextAlign.Center,
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = stringResource(R.string.orders_empty_hint),
                    style = MaterialTheme.typography.bodyMedium,
                    color = scheme.onSurfaceVariant,
                    textAlign = TextAlign.Center,
                    lineHeight = 22.sp,
                    modifier = Modifier.widthIn(max = 320.dp),
                )
                Spacer(modifier = Modifier.height(28.dp))
                Button(
                    onClick = onContinueShopping,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = scheme.primary,
                        contentColor = scheme.onPrimary,
                    ),
                ) {
                    Text(
                        text = stringResource(R.string.continue_shopping),
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OrdersSuccessContent(
    groups: List<OrderGroupModel>,
    navController: NavController,
    onRefresh: () -> Unit,
) {
    if (groups.isEmpty()) {
        OrdersEmptyState(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            onContinueShopping = {
                navController.navigate(HomeScreen) {
                    launchSingleTop = true
                }
            },
        )
        return
    }

    val pullState = rememberPullToRefreshState()
    val refreshRunner by rememberUpdatedState(onRefresh)

    LaunchedEffect(pullState.isRefreshing) {
        if (!pullState.isRefreshing) return@LaunchedEffect
        refreshRunner()
        delay(450)
        pullState.endRefresh()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        PullToRefreshContainer(
            state = pullState,
            modifier = Modifier.align(Alignment.TopCenter),
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .nestedScroll(pullState.nestedScrollConnection),
            contentPadding = PaddingValues(bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(0.dp),
        ) {
            items(
                items = groups,
                key = { g -> g.orderGroupId ?: g.orderDate.hashCode() },
                contentType = { _ -> "order_group" },
            ) { group ->
                OrderGroupCard(
                    group = group,
                    onOpenDetail = { order ->
                        navController.navigate(OrderDetailRoute(order.toNavOrderDetail()))
                    },
                )
            }
        }
    }
}

@Composable
private fun OrderGroupCard(
    group: OrderGroupModel,
    onOpenDetail: (OrdersData) -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        border = BorderStroke(1.dp, Color.Black.copy(alpha = 0.06f)),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = group.orderDate,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = stringResource(R.string.checkout_group_total, CurrencyUtils.formatPrice(group.grandTotal)),
                style = MaterialTheme.typography.titleMedium,
            )
            Spacer(modifier = Modifier.height(8.dp))
            group.orders.forEach { order ->
                OrderCard(
                    order = order,
                    onOpenDetail = { onOpenDetail(order) },
                )
            }
        }
    }
}

@Composable
private fun OrderCard(
    order: OrdersData,
    onOpenDetail: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
        border = BorderStroke(1.dp, Color.Black.copy(alpha = 0.06f)),
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = if (order.storeName.isNotBlank()) {
                        "${order.storeName} · ${stringResource(R.string.order_id, order.id)}"
                    } else {
                        stringResource(R.string.order_id, order.id)
                    },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    text = order.orderDate,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = stringResource(
                        R.string.quantity_label,
                        order.items.sumOf { it.quantity },
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Text(
                    text = stringResource(
                        R.string.order_total,
                        CurrencyUtils.formatPrice(order.totalAmount),
                    ),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                OrderStatusSurface(order.status)
                TextButton(onClick = onOpenDetail) {
                    Text(stringResource(R.string.details))
                }
            }
        }
    }
}

@Composable
private fun OrderStatusSurface(status: String) {
    val (bg, fg) = statusColors(status)
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = bg,
        tonalElevation = 0.dp,
    ) {
        Text(
            text = OrderStatusLabels.label(status),
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium,
            color = fg,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

@Composable
private fun statusColors(status: String): Pair<Color, Color> {
    val scheme = MaterialTheme.colorScheme
    return when (status) {
        "Pending" -> scheme.primaryContainer to scheme.onPrimaryContainer
        "Delivered" -> scheme.tertiaryContainer to scheme.onTertiaryContainer
        "Cancelled" -> scheme.errorContainer to scheme.onErrorContainer
        else -> scheme.surfaceVariant to scheme.onSurfaceVariant
    }
}
