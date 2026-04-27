package com.himanshu_kumar.shoppingapp.di

import com.himanshu_kumar.shoppingapp.ui.feature.authentication.login.LoginViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.authentication.register.RegisterViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.cart.CartViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.category_list.CategoryItemsListViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.home.HomeViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.orders.OrdersViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.product_details.ProductDetailsViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.profile.ProfileViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.summary.CartSummaryViewModel
import com.himanshu_kumar.shoppingapp.ui.feature.wishlist.WishlistViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val viewModelModule = module {
    viewModel { HomeViewModel(get(), get(), get())}                    // Inject dependency into HomeViewModel
    viewModel { ProductDetailsViewModel(get(), get(), get(), get(), get(), get()) }
    viewModel { CartViewModel(get(), get(), get(), get()) }
    viewModel { CartSummaryViewModel(get(), get (),get()) }
    viewModel { OrdersViewModel(get(), get()) }
    viewModel { LoginViewModel(get(), get()) }
    viewModel { RegisterViewModel(get(), get(), get()) }
    viewModel { CategoryItemsListViewModel(get()) }
    viewModel { ProfileViewModel(get(), get(), get()) }
    viewModel { WishlistViewModel(get(), get()) }
}
