package com.himanshu_kumar.shoppingapp.navigation

import androidx.navigation.NavController

fun NavController.navigateToStoreProfile(storeSlug: String, storeName: String = "") {
    navigate(VendorStorefrontRoute(storeSlug = storeSlug, storeName = storeName))
}
