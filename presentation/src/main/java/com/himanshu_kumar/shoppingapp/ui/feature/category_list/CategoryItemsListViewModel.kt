package com.himanshu_kumar.shoppingapp.ui.feature.category_list

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.shoppingapp.navigation.ALL_PRODUCTS_CATEGORY_ID
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CategoryItemsListViewModel(
    private val useCase: GetProductUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<CategoryItemsListUIEvents>(CategoryItemsListUIEvents.Loading)
    val uiState: StateFlow<CategoryItemsListUIEvents> = _uiState

    private var apiCategory: Int? = null
    private var nextSkip = 0
    private val loaded = ArrayList<ProductListModel>()

    fun getProductsWithCategory(category: Int) {
        apiCategory = if (category == ALL_PRODUCTS_CATEGORY_ID) null else category
        nextSkip = 0
        loaded.clear()
        loadPage(isFirstPage = true)
    }

    /**
     * Loads the next [PAGE_SIZE] products (append). No-op if not in success state, no more pages, or already loading.
     * Search/filter UIs should only call this when the search field is empty so paging matches server order.
     */
    fun loadNextPage() {
        val current = _uiState.value
        if (current !is CategoryItemsListUIEvents.Success) return
        if (!current.hasMore || current.isLoadingMore) return
        loadPage(isFirstPage = false)
    }

    private fun loadPage(isFirstPage: Boolean) {
        viewModelScope.launch {
            if (isFirstPage) {
                _uiState.value = CategoryItemsListUIEvents.Loading
            } else {
                val s = _uiState.value
                if (s is CategoryItemsListUIEvents.Success) {
                    _uiState.value = s.copy(isLoadingMore = true, loadMoreError = null)
                }
            }
            when (val result = useCase.execute(apiCategory, PAGE_SIZE, nextSkip)) {
                is ResultWrapper.Success -> {
                    val page = result.value
                    if (isFirstPage) {
                        loaded.clear()
                    }
                    loaded.addAll(page)
                    nextSkip = loaded.size
                    val hasMore = page.size == PAGE_SIZE
                    _uiState.value = CategoryItemsListUIEvents.Success(
                        data = loaded.toList(),
                        hasMore = hasMore,
                        isLoadingMore = false,
                        loadMoreError = null,
                    )
                }
                is ResultWrapper.Failure -> {
                    if (isFirstPage) {
                        _uiState.value = CategoryItemsListUIEvents.Error(result.message)
                    } else {
                        val s = _uiState.value
                        if (s is CategoryItemsListUIEvents.Success) {
                            _uiState.value = s.copy(
                                isLoadingMore = false,
                                loadMoreError = result.message,
                            )
                        } else {
                            _uiState.value = CategoryItemsListUIEvents.Error(result.message)
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

sealed class CategoryItemsListUIEvents {
    data object Loading : CategoryItemsListUIEvents()
    data class Success(
        val data: List<ProductListModel>,
        val hasMore: Boolean,
        val isLoadingMore: Boolean,
        val loadMoreError: String? = null,
    ) : CategoryItemsListUIEvents()

    data class Error(val message: String) : CategoryItemsListUIEvents()
}
