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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.toRoute
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import com.himanshu_kumar.shoppingapp.navigation.CartScreen
import com.himanshu_kumar.shoppingapp.navigation.CartSummaryScreen
import com.himanshu_kumar.shoppingapp.navigation.CategoryNavArgs
import com.himanshu_kumar.shoppingapp.navigation.CategoryItemsScreen
import com.himanshu_kumar.shoppingapp.navigation.HomeScreen
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
import com.himanshu_kumar.shoppingapp.ui.feature.category_list.CategoryItemsListScreen
import com.himanshu_kumar.shoppingapp.ui.feature.home.HomeScreen
import com.himanshu_kumar.shoppingapp.ui.feature.orders.OrderDetailScreen
import com.himanshu_kumar.shoppingapp.ui.feature.orders.OrdersScreen
import com.himanshu_kumar.shoppingapp.ui.feature.product_details.ProductDetailsScreen
import com.himanshu_kumar.shoppingapp.ui.feature.profile.ProfileScreen
import com.himanshu_kumar.shoppingapp.ui.feature.settings.SettingsScreen as SettingsContent
import com.himanshu_kumar.shoppingapp.ui.feature.wishlist.WishlistScreen as WishlistContent
import com.himanshu_kumar.shoppingapp.ui.feature.summary.CartSummaryScreen
import com.himanshu_kumar.shoppingapp.ui.feature.user_address.UserAddressScreen
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
            DurmusBabaTheme {
                val shouldShowBottomBar = remember { mutableStateOf(false) }
                val navController = rememberNavController()
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
                            startDestination = if (appSession.getUser() != 0) HomeScreen else LoginScreen,
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
                            composable<HomeScreen> {
                                shouldShowBottomBar.value = true
                                HomeScreen(navController)
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
                                val listTitle =
                                    prev?.savedStateHandle?.get<String>(CategoryNavArgs.CATEGORY_LIST_TITLE)
                                if (categoryId != null) {
                                    CategoryItemsListScreen(
                                        navController = navController,
                                        category = categoryId,
                                        listTitle = listTitle,
                                    )
                                }
                            }
                            composable<WishlistRoute> {
                                shouldShowBottomBar.value = false
                                WishlistContent(navController)
                            }
                            composable<SettingsRoute> {
                                shouldShowBottomBar.value = false
                                SettingsContent(navController)
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
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavController) {
    NavigationBar {
        val currentRoute = navController.currentBackStackEntryAsState().value?.destination?.route
        val items = listOf(
            BottomNavItem.Home,
            BottomNavItem.Orders,
            BottomNavItem.Profile
        )

        items.forEach { item ->
            val isSelected = currentRoute?.substringBefore("?") == item.route::class.qualifiedName
            val title = stringResource(item.titleRes)
            NavigationBarItem(
                selected = isSelected,
                onClick = {
                    navController.navigate(item.route) {
                        navController.graph.startDestinationRoute?.let { startRoute ->
                            popUpTo(startRoute) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                label = {
                    Text(text = title)
                },
                icon = {
                    Image(
                        painter = painterResource(id = item.icon),
                        contentDescription = title,
                        colorFilter = ColorFilter.tint(
                            if (isSelected) colorResource(R.color.button_color) else Color.Gray
                        )
                    )
                },
                colors = NavigationBarItemDefaults.colors().copy(
                    selectedIconColor = colorResource(R.color.button_color),
                    selectedTextColor = colorResource(R.color.button_color),
                    unselectedIconColor = Color.Gray,
                    unselectedTextColor = Color.Gray
                )
            )
        }
    }
}

sealed class BottomNavItem(
    val route: Any,
    @StringRes val titleRes: Int,
    val icon: Int
) {
    data object Home : BottomNavItem(HomeScreen, R.string.nav_home, R.drawable.ic_home)
    data object Orders : BottomNavItem(OrdersScreen, R.string.nav_orders, R.drawable.ic_order)
    data object Profile : BottomNavItem(ProfileScreen, R.string.nav_profile, R.drawable.ic_profile_br)
}
