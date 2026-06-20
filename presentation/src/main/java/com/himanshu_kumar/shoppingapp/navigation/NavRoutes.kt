package com.himanshu_kumar.shoppingapp.navigation

import com.himanshu_kumar.shoppingapp.model.UiProductModel
import kotlinx.serialization.Serializable


@Serializable
object LoginScreen

@Serializable
object RegisterScreen

@Serializable
object HomeScreen

@Serializable
object MarketScreen

@Serializable
object CartScreen

@Serializable
object OrdersScreen

@Serializable
object ProfileScreen

@Serializable
object CartSummaryScreen

@Serializable
object CatalogSearchScreen

@Serializable
object CategoryItemsScreen

@Serializable
data class OrderDetailRoute(val order: NavOrderDetail)

@Serializable
object WishlistScreen

@Serializable
object SettingsScreen

@Serializable
object VendorListScreen

@Serializable
object VendorHubScreen

@Serializable
object StoreApplicationScreen

@Serializable
data class VendorStorefrontRoute(val storeSlug: String, val storeName: String)

@Serializable
data class ProductDetails(val product:UiProductModel)

@Serializable
data class UserAddressRoute(val userAddressWrapper: UserAddressWrapper)