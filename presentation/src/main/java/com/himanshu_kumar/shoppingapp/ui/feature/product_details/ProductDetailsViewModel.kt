package com.himanshu_kumar.shoppingapp.ui.feature.product_details

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.request.AddCartRequestModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.AddToCartUseCase
import com.himanshu_kumar.domain.usecase.AddToWishlistUseCase
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.domain.usecase.GetWishlistUseCase
import com.himanshu_kumar.domain.usecase.RemoveFromWishlistUseCase
import com.himanshu_kumar.shoppingapp.UserSession
import com.himanshu_kumar.shoppingapp.model.UiProductModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProductDetailsViewModel(
    private val useCase: AddToCartUseCase,
    private val getProductUseCase: GetProductUseCase,
    private val appSession: UserSession,
    private val getWishlistUseCase: GetWishlistUseCase,
    private val addToWishlistUseCase: AddToWishlistUseCase,
    private val removeFromWishlistUseCase: RemoveFromWishlistUseCase,
) : ViewModel() {
    private val _state = MutableStateFlow<ProductDetailsState>(ProductDetailsState.Nothing)
    val state = _state

    private val _similarProducts = MutableStateFlow<List<ProductListModel>>(emptyList())
    val similarProducts = _similarProducts

    private val _wishlistedProductIds = MutableStateFlow<Set<Int>>(emptySet())
    val wishlistedProductIds: StateFlow<Set<Int>> = _wishlistedProductIds.asStateFlow()

    val userId = appSession.getUser()

    fun acknowledgeState() {
        _state.value = ProductDetailsState.Nothing
    }

    fun addProductToCart(product: UiProductModel, navigateToCheckout: Boolean) {
        if (userId == 0) {
            _state.value = ProductDetailsState.Error("Please log in first")
            return
        }
        viewModelScope.launch {
            _state.value = ProductDetailsState.Loading
            val result = useCase.execute(
                AddCartRequestModel(
                    productId = product.id,
                    productName = product.title,
                    price = product.price,
                    quantity = 1,
                    userId = userId,
                ),
                userId = userId.toLong()
            )
            when (result) {
                is ResultWrapper.Success -> {
                    _state.value = ProductDetailsState.Success(
                        message = "Product added to cart successfully",
                        navigateToCheckout = navigateToCheckout,
                    )
                }
                is ResultWrapper.Failure -> {
                    _state.value = ProductDetailsState.Error(result.message)
                }
            }
        }
    }

    fun getSimilarProducts(categoryId: Int) {
        viewModelScope.launch {
            _similarProducts.value = getProducts(categoryId)
        }
    }

    fun refreshWishlistIds() {
        if (userId == 0) {
            _wishlistedProductIds.value = emptySet()
            return
        }
        viewModelScope.launch {
            when (val r = getWishlistUseCase.execute(userId.toLong())) {
                is ResultWrapper.Success -> {
                    _wishlistedProductIds.value = r.value.map { it.id }.toSet()
                }
                is ResultWrapper.Failure -> { }
            }
        }
    }

    fun toggleWishlist(product: UiProductModel) {
        if (userId == 0) {
            _state.value = ProductDetailsState.Error("Please log in first")
            return
        }
        val uid = userId.toLong()
        val inList = product.id in _wishlistedProductIds.value
        viewModelScope.launch {
            val result = if (inList) {
                removeFromWishlistUseCase.execute(uid, product.id)
            } else {
                addToWishlistUseCase.execute(uid, product.id)
            }
            when (result) {
                is ResultWrapper.Success -> {
                    _wishlistedProductIds.value = result.value.map { it.id }.toSet()
                }
                is ResultWrapper.Failure -> {
                    _state.value = ProductDetailsState.Error(result.message)
                }
            }
        }
    }

    private suspend fun getProducts(category: Int?): List<ProductListModel> {
        getProductUseCase.execute(category).let { result ->
            when (result) {
                is ResultWrapper.Success -> return result.value
                is ResultWrapper.Failure -> return emptyList()
            }
        }
    }
}

sealed class ProductDetailsState {
    data object Loading : ProductDetailsState()
    data object Nothing : ProductDetailsState()
    data class Success(val message: String, val navigateToCheckout: Boolean = false) : ProductDetailsState()
    data class Error(val message: String) : ProductDetailsState()
}
