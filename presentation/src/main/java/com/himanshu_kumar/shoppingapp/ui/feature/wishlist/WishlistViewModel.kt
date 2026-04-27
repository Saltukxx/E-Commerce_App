package com.himanshu_kumar.shoppingapp.ui.feature.wishlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetWishlistUseCase
import com.himanshu_kumar.shoppingapp.UserSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class WishlistViewModel(
    private val getWishlistUseCase: GetWishlistUseCase,
    private val userSession: UserSession,
) : ViewModel() {

    private val _state = MutableStateFlow<WishlistUiState>(WishlistUiState.Loading)
    val state: StateFlow<WishlistUiState> = _state

    val userId: Int get() = userSession.getUser()

    fun load() {
        val uid = userSession.getUser()
        if (uid == 0) {
            _state.value = WishlistUiState.Error("Please log in first")
            return
        }
        viewModelScope.launch {
            _state.value = WishlistUiState.Loading
            when (val r = getWishlistUseCase.execute(uid.toLong())) {
                is ResultWrapper.Success -> {
                    _state.value = WishlistUiState.Success(r.value)
                }
                is ResultWrapper.Failure -> {
                    _state.value = WishlistUiState.Error(r.message)
                }
            }
        }
    }
}

sealed class WishlistUiState {
    data object Loading : WishlistUiState()
    data class Success(val products: List<ProductListModel>) : WishlistUiState()
    data class Error(val message: String) : WishlistUiState()
}
