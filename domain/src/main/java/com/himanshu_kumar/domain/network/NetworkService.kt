package com.himanshu_kumar.domain.network



import com.himanshu_kumar.domain.model.StoreApplicationRequest

import com.himanshu_kumar.domain.model.AddressDomainModel

import com.himanshu_kumar.domain.model.CartItemModel

import com.himanshu_kumar.domain.model.CartModel

import com.himanshu_kumar.domain.model.CartSummary

import com.himanshu_kumar.domain.model.CategoriesListModel

import com.himanshu_kumar.domain.model.CheckoutConfigModel
import com.himanshu_kumar.domain.model.CheckoutSessionModel
import com.himanshu_kumar.domain.model.CheckoutStatusModel
import com.himanshu_kumar.domain.model.OrderGroupResult

import com.himanshu_kumar.domain.model.OrdersListModel

import com.himanshu_kumar.domain.model.ProductListModel

import com.himanshu_kumar.domain.model.LoginResult

import com.himanshu_kumar.domain.model.StoreModel

import com.himanshu_kumar.domain.model.UserDomainModel

import com.himanshu_kumar.domain.model.request.AddCartRequestModel



interface NetworkService {

    suspend fun getProducts(

        category: Int?,

        limit: Int? = null,

        skip: Int? = null,

        query: String? = null,

        storeSlug: String? = null,

    ): ResultWrapper<List<ProductListModel>>



    suspend fun getStores(): ResultWrapper<List<StoreModel>>

    suspend fun getStoreBySlug(slug: String): ResultWrapper<StoreModel>

    suspend fun submitStoreApplication(request: StoreApplicationRequest): ResultWrapper<String>



    suspend fun getCategories(): ResultWrapper<List<CategoriesListModel>>

    suspend fun addProductToCart(request: AddCartRequestModel, userId: Long): ResultWrapper<CartModel>

    suspend fun getCart(userId: Long): ResultWrapper<CartModel>

    suspend fun updateQuantity(cartItemModel: CartItemModel, userId: Long): ResultWrapper<CartModel>

    suspend fun deleteItem(cartItemId: Int, userId: Long): ResultWrapper<CartModel>

    suspend fun getCartSummary(userId: Long): ResultWrapper<CartSummary>

    suspend fun placeOrder(address: AddressDomainModel, userId: Long): ResultWrapper<OrderGroupResult>

    suspend fun getCheckoutConfig(): ResultWrapper<CheckoutConfigModel>

    suspend fun createCheckoutSession(
        address: AddressDomainModel,
        userId: Long,
    ): ResultWrapper<CheckoutSessionModel>

    suspend fun getCheckoutStatus(
        userId: Long,
        checkoutId: Int,
    ): ResultWrapper<CheckoutStatusModel>

    suspend fun getOrderList(userId: Long): ResultWrapper<OrdersListModel>

    suspend fun login(email: String, password: String): ResultWrapper<LoginResult>

    suspend fun register(email: String, password: String, name: String): ResultWrapper<UserDomainModel>

    suspend fun getProfile(): ResultWrapper<UserDomainModel>

    suspend fun logout(refreshToken: String): ResultWrapper<Unit>

    suspend fun getWishlist(userId: Long): ResultWrapper<List<ProductListModel>>

    suspend fun addToWishlist(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>>

    suspend fun removeFromWishlist(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>>

    suspend fun submitPriceInquiry(productId: Int): ResultWrapper<String>

    suspend fun validateStoredSession(): ResultWrapper<Boolean>

}



sealed class ResultWrapper<out T> {

    data class Success<out T>(val value: T) : ResultWrapper<T>()

    data class Failure(val message: String) : ResultWrapper<Nothing>()

}

