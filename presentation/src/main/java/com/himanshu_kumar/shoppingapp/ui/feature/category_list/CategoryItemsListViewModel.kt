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

    fun getProductsWithCategory(category: Int) {
        val apiCategory = if (category == ALL_PRODUCTS_CATEGORY_ID) {
            null
        } else {
            category
        }
        getProducts(apiCategory)
    }

    private fun getProducts(category: Int?) {
        viewModelScope.launch {
            _uiState.value = CategoryItemsListUIEvents.Loading
            when (val result = useCase.execute(category)) {
                is ResultWrapper.Success -> {
                    _uiState.value = CategoryItemsListUIEvents.Success(result.value)
                }
                is ResultWrapper.Failure -> {
                    _uiState.value = CategoryItemsListUIEvents.Error(result.message)
                }
            }
        }
    }
}


sealed class CategoryItemsListUIEvents{
    data object Loading:CategoryItemsListUIEvents()
    data class Success(val data:List<ProductListModel>):CategoryItemsListUIEvents()
    data class Error(val message:String):CategoryItemsListUIEvents()
}
