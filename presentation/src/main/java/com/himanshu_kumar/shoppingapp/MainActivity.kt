package com.himanshu_kumar.shoppingapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.CartScreen
import com.himanshu_kumar.shoppingapp.navigation.CartSummaryScreen
import com.himanshu_kumar.shoppingapp.navigation.CatalogSearchNavArgs
import com.himanshu_kumar.shoppingapp.navigation.CatalogSearchScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryNavArgs
import com.himanshu_kumar.shoppingapp.navigation.CategoryItemsScreen
import com.himanshu_kumar.shoppingapp.navigation.ALL_PRODUCTS_CATEGORY_ID
import com.himanshu_kumar.shoppingapp.navigation.HomeScreen as HomeRoute
import com.himanshu_kumar.shoppingapp.navigation.MarketScreen as MarketRoute
import com.himanshu_kumar.shoppingapp.navigation.LoginScreen
import com.himanshu_kumar.shoppingapp.navigation.NavOrderDetail
import com.himanshu_kumar.shoppingapp.navigation.OrderDetailRoute
import com.himanshu_kumar.shoppingapp.navigation.OrdersScreen
import com.himanshu_kumar.shoppingapp.navigation.ProductDetails
import com.himanshu_kumar.shoppingapp.navigation.ProfileScreen
import com.himanshu_kumar.shoppingapp.navigation.RegisterScreen
import com.himanshu_kumar.shoppingapp.navigation.SettingsScreen as SettingsRoute
import com.himanshu_kumar.shoppingapp.navigation.WishlistScreen as WishlistRoute
import com.himanshu_kumar.shoppingapp.navigation.UserAddressRoute
import com.himanshu_kumar.shoppingapp.navigation.UserAddressWrapper
import com.himanshu_kumar.shoppingapp.navigation.orderDetailNavType
import com.himanshu_kumar.shoppingapp.navigation.productNavType
import com.himanshu_kumar.shoppingapp.navigation.userAddressNavType
import com.himanshu_kumar.shoppingapp.ui.feature.authentication.login.LoginScreen
import com.himanshu_kumar.shoppingapp.ui.feature.authentication.register.RegisterScreen
import com.himanshu_kumar.shoppingapp.ui.feature.cart.CartScreen
import com.himanshu_kumar.shoppingapp.ui.feature.catalog_search.CatalogSearchScreen as CatalogSearchContent
import com.himanshu_kumar.shoppingapp.ui.feature.category_list.CategoryItemsListScreen
import com.himanshu_kumar.shoppingapp.ui.feature.home.HomeScreen as HomeContent
import com.himanshu_kumar.shoppingapp.ui.feature.market.MarketScreen as MarketContent
import com.himanshu_kumar.shoppingapp.ui.feature.orders.OrderDetailScreen
import com.himanshu_kumar.shoppingapp.ui.feature.orders.OrdersScreen
import com.himanshu_kumar.shoppingapp.ui.feature.product_details.ProductDetailsScreen
import com.himanshu_kumar.shoppingapp.ui.feature.profile.ProfileScreen
import com.himanshu_kumar.shoppingapp.ui.feature.settings.SettingsScreen as SettingsContent
import com.himanshu_kumar.shoppingapp.ui.feature.wishlist.WishlistScreen as WishlistContent
import com.himanshu_kumar.shoppingapp.ui.feature.summary.CartSummaryScreen
import com.himanshu_kumar.shoppingapp.ui.feature.user_address.UserAddressScreen
import com.himanshu_kumar.shoppingapp.navigation.StoreApplicationScreen
import com.himanshu_kumar.shoppingapp.navigation.VendorListScreen
import com.himanshu_kumar.shoppingapp.navigation.VendorStorefrontRoute
import com.himanshu_kumar.shoppingapp.ui.feature.vendors.StoreApplicationScreen as StoreApplicationContent
import com.himanshu_kumar.shoppingapp.ui.feature.vendors.VendorListScreen as VendorListContent
import com.himanshu_kumar.shoppingapp.ui.feature.vendors.VendorHubScreen as VendorHubContent
import com.himanshu_kumar.shoppingapp.navigation.VendorHubScreen
import com.himanshu_kumar.domain.usecase.ValidateSessionUseCase
import com.himanshu_kumar.shoppingapp.ui.feature.store.StoreProfileScreen
import com.himanshu_kumar.shoppingapp.ui.theme.DurmusBabaTheme
import org.koin.android.ext.android.inject
import kotlin.reflect.typeOf

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val appSession: AppSession by inject()
            val validateSession: ValidateSessionUseCase by inject()
            DurmusBabaTheme {
                val shouldShowBottomBar = remember { mutableStateOf(false) }
                val navController = rememberNavController()
                var sessionReady by remember { mutableStateOf(false) }
                var startAtHome by remember { mutableStateOf(false) }

                LaunchedEffect(Unit) {
                    if (appSession.hasStoredCredentials()) {
                        startAtHome = validateSession.execute()
                        if (!startAtHome) {
                            appSession.clearUserSession()
                        }
                    } else if (appSession.getUser() != 0) {
                        appSession.clearUserSession()
                    }
                    sessionReady = true
                }

                if (!sessionReady) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                } else {
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize(),
                    bottomBar = {
                        AnimatedVisibility(visible = shouldShowBottomBar.value, enter = fadeIn()) {
                            BottomNavigationBar(navController)
                        }
                    }
                ) {
                    Surface(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(it)
                    ) {
                        NavHost(
                            navController = navController,
                            startDestination = if (startAtHome) HomeRoute else LoginScreen,
                            enterTransition = { fadeIn(animationSpec = tween(700)) },
                            exitTransition = { fadeOut(animationSpec = tween(700)) },
                            popEnterTransition = { fadeIn(animationSpec = tween(700)) },
                            popExitTransition = { fadeOut(animationSpec = tween(700)) }
                        ) {

                            composable<RegisterScreen> {
                                shouldShowBottomBar.value = false
                                RegisterScreen(navController)
                            }

                            composable<LoginScreen> {
                                shouldShowBottomBar.value = false
                                LoginScreen(navController)
                            }
                            composable<HomeRoute> {
                                shouldShowBottomBar.value = true
                                HomeContent(navController)
                            }
                            composable<MarketRoute> {
                                shouldShowBottomBar.value = true
                                MarketContent(navController)
                            }
                            composable<CartScreen> {
                                shouldShowBottomBar.value = false
                                CartScreen(navController)
                            }
                            composable<OrdersScreen> {
                                shouldShowBottomBar.value = true
                                OrdersScreen(navController)
                            }
                            composable<OrderDetailRoute>(
                                typeMap = mapOf(typeOf<NavOrderDetail>() to orderDetailNavType)
                            ) {
                                shouldShowBottomBar.value = false
                                val route = it.toRoute<OrderDetailRoute>()
                                OrderDetailScreen(navController, route.order)
                            }
                            composable<ProfileScreen> {
                                shouldShowBottomBar.value = true
                                ProfileScreen(navController)
                            }
                            composable<ProductDetails>(
                                typeMap = mapOf(typeOf<UiProductModel>() to productNavType)
                            ) {
                                shouldShowBottomBar.value = false
                                val productRoute = it.toRoute<ProductDetails>()
                                ProductDetailsScreen(navController, productRoute.product)
                            }
                            composable<CategoryItemsScreen> {
                                shouldShowBottomBar.value = false
                                val prev = navController.previousBackStackEntry
                                val categoryId =
                                    prev?.savedStateHandle?.get<Int>(CategoryNavArgs.CATEGORY_ID)
                                        ?: ALL_PRODUCTS_CATEGORY_ID
                                val listTitle =
                                    prev?.savedStateHandle?.get<String>(CategoryNavArgs.CATEGORY_LIST_TITLE)
                                val storeSlug = prev?.savedStateHandle?.get<String>(CategoryNavArgs.STORE_SLUG)
                                CategoryItemsListScreen(
                                    navController = navController,
                                    category = categoryId,
                                    listTitle = listTitle,
                                    storeSlug = storeSlug,
                                )
                            }
                            composable<WishlistRoute> {
                                shouldShowBottomBar.value = false
                                WishlistContent(navController)
                            }
                            composable<SettingsRoute> {
                                shouldShowBottomBar.value = false
                                SettingsContent(navController, appSession)
                            }
                            composable<VendorListScreen> {
                                shouldShowBottomBar.value = false
                                VendorListContent(navController)
                            }
                            composable<VendorHubScreen> {
                                shouldShowBottomBar.value = false
                                VendorHubContent(navController)
                            }
                            composable<StoreApplicationScreen> {
                                shouldShowBottomBar.value = false
                                StoreApplicationContent(navController)
                            }
                            composable<VendorStorefrontRoute> {
                                shouldShowBottomBar.value = false
                                val route = it.toRoute<VendorStorefrontRoute>()
                                StoreProfileScreen(
                                    navController = navController,
                                    storeSlug = route.storeSlug,
                                    fallbackStoreName = route.storeName,
                                )
                            }

                            composable<UserAddressRoute>(
                                typeMap = mapOf(typeOf<UserAddressWrapper>() to userAddressNavType)
                            ) {
                                shouldShowBottomBar.value = false
                                val userAddressRoute = it.toRoute<UserAddressRoute>()
                                UserAddressScreen(
                                    navController = navController,
                                    userAddress = userAddressRoute.userAddressWrapper.userAddress
                                )
                            }
                            composable<CartSummaryScreen> {
                                shouldShowBottomBar.value = false
                                CartSummaryScreen(navController)
                            }
                            composable<CatalogSearchScreen> {
                                shouldShowBottomBar.value = false
                                val initial = navController.previousBackStackEntry
                                    ?.savedStateHandle
                                    ?.get<String>(CatalogSearchNavArgs.INITIAL_QUERY)
                                    .orEmpty()
                                CatalogSearchContent(
                                    navController = navController,
                                    initialQuery = initial,
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

@Composable
fun BottomNavigationBar(navController: NavController) {
    val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route
    val items = listOf(
        BottomNavItem.Home,
        BottomNavItem.Market,
        BottomNavItem.Orders,
        BottomNavItem.Profile,
    )
    val primary = colorResource(R.color.stitch_primary)
    val onSurfaceVariant = colorResource(R.color.on_surface_variant)
    val secondaryContainer = colorResource(R.color.secondary_container)
    val onSecondaryContainer = colorResource(R.color.on_secondary_container)

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = colorResource(R.color.surface_container_low),
        shadowElevation = 8.dp,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            items.forEach { item ->
                val isSelected = currentRoute?.substringBefore("?") == item.route::class.qualifiedName
                val title = stringResource(item.titleRes)
                val contentColor = if (isSelected) onSecondaryContainer else onSurfaceVariant
                Column(
                    modifier = Modifier
                        .clip(RoundedCornerShape(100.dp))
                        .background(if (isSelected) secondaryContainer else Color.Transparent)
                        .clickable {
                            navController.navigate(item.route) {
                                navController.graph.startDestinationRoute?.let { startRoute ->
                                    popUpTo(startRoute) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            }
                        }
                        .padding(horizontal = if (isSelected) 20.dp else 12.dp, vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Image(
                        painter = painterResource(id = item.icon),
                        contentDescription = title,
                        modifier = Modifier.size(22.dp),
                        colorFilter = ColorFilter.tint(if (isSelected) primary else onSurfaceVariant),
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = title,
                        style = MaterialTheme.typography.labelSmall,
                        color = contentColor,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                    )
                }
            }
        }
    }
}

sealed class BottomNavItem(
    val route: Any,
    @StringRes val titleRes: Int,
    val icon: Int
) {
    data object Home : BottomNavItem(HomeRoute, R.string.nav_home, R.drawable.ic_home)
    data object Market : BottomNavItem(MarketRoute, R.string.nav_market, R.drawable.ic_market)
    data object Orders : BottomNavItem(OrdersScreen, R.string.nav_orders, R.drawable.ic_order)
    data object Profile : BottomNavItem(ProfileScreen, R.string.nav_profile, R.drawable.ic_profile_br)
}
