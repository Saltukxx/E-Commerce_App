package com.himanshu_kumar.shoppingapp.ui.feature.store

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.domain.usecase.GetStoreBySlugUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class StoreProfileViewModel(
    private val getStoreBySlug: GetStoreBySlugUseCase,
    private val getProducts: GetProductUseCase,
    private val storeSlug: String,
) : ViewModel() {

    private val _uiState = MutableStateFlow<StoreProfileUiState>(StoreProfileUiState.Loading)
    val uiState: StateFlow<StoreProfileUiState> = _uiState

    private var nextSkip = 0
    private val loaded = ArrayList<ProductListModel>()

    init {
        loadStoreAndProducts()
    }

    fun reload() {
        nextSkip = 0
        loaded.clear()
        loadStoreAndProducts()
    }

    fun loadNextPage() {
        val current = _uiState.value
        if (current !is StoreProfileUiState.Success) return
        if (!current.hasMore || current.isLoadingMore) return
        loadProducts(isFirstPage = false, store = current.store)
    }

    private fun loadStoreAndProducts() {
        viewModelScope.launch {
            _uiState.value = StoreProfileUiState.Loading
            when (val storeResult = getStoreBySlug.execute(storeSlug)) {
                is ResultWrapper.Success -> loadProducts(isFirstPage = true, store = storeResult.value)
                is ResultWrapper.Failure -> {
                    _uiState.value = StoreProfileUiState.Error(storeResult.message)
                }
            }
        }
    }

    private fun loadProducts(isFirstPage: Boolean, store: StoreModel) {
        viewModelScope.launch {
            if (!isFirstPage) {
                val current = _uiState.value
                if (current is StoreProfileUiState.Success) {
                    _uiState.value = current.copy(isLoadingMore = true, loadMoreError = null)
                }
            }
            when (
                val result = getProducts.execute(
                    category = null,
                    limit = PAGE_SIZE,
                    skip = nextSkip,
                    query = null,
                    storeSlug = store.slug,
                )
            ) {
                is ResultWrapper.Success -> {
                    val page = result.value
                    if (isFirstPage) {
                        loaded.clear()
                    }
                    loaded.addAll(page)
                    nextSkip = loaded.size
                    _uiState.value = StoreProfileUiState.Success(
                        store = store,
                        products = loaded.toList(),
                        hasMore = page.size == PAGE_SIZE,
                        isLoadingMore = false,
                        loadMoreError = null,
                    )
                }
                is ResultWrapper.Failure -> {
                    if (isFirstPage) {
                        _uiState.value = StoreProfileUiState.Error(result.message)
                    } else {
                        val current = _uiState.value
                        if (current is StoreProfileUiState.Success) {
                            _uiState.value = current.copy(
                                isLoadingMore = false,
                                loadMoreError = result.message,
                            )
                        }
                    }
                }
            }
        }
    }

    companion object {
        const val PAGE_SIZE = 30
    }
}

sealed class StoreProfileUiState {
    data object Loading : StoreProfileUiState()
    data class Success(
        val store: StoreModel,
        val products: List<ProductListModel>,
        val hasMore: Boolean,
        val isLoadingMore: Boolean,
        val loadMoreError: String? = null,
    ) : StoreProfileUiState()

    data class Error(val message: String) : StoreProfileUiState()
}
