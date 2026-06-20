package com.himanshu_kumar.shoppingapp.ui.feature.market

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetCategoriesUserCase
import com.himanshu_kumar.domain.usecase.GetStoresUseCase
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MarketViewModel(
    private val getCategoriesUserCase: GetCategoriesUserCase,
    private val getStoresUseCase: GetStoresUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow<MarketUiState>(MarketUiState.Loading)
    val uiState: StateFlow<MarketUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun loadCategories() = load()

    private fun load() {
        viewModelScope.launch {
            _uiState.value = MarketUiState.Loading
            try {
                coroutineScope {
                    val categoriesDeferred = async { getCategoriesUserCase.execute() }
                    val storesDeferred = async { getStoresUseCase.execute() }
                    val categoriesResult = categoriesDeferred.await()
                    val storesResult = storesDeferred.await()

                    val categories = when (categoriesResult) {
                        is ResultWrapper.Success -> categoriesResult.value
                        is ResultWrapper.Failure -> emptyList()
                    }
                    val stores = when (storesResult) {
                        is ResultWrapper.Success -> storesResult.value
                        is ResultWrapper.Failure -> emptyList()
                    }

                    if (categories.isEmpty() && stores.isEmpty()) {
                        val errorMsg = (categoriesResult as? ResultWrapper.Failure)?.message
                            ?: (storesResult as? ResultWrapper.Failure)?.message
                            ?: "Failed to load market"
                        _uiState.value = MarketUiState.Error(errorMsg)
                    } else {
                        _uiState.value = MarketUiState.Success(categories, stores)
                    }
                }
            } catch (e: Exception) {
                _uiState.value = MarketUiState.Error(e.message ?: "Failed to load market")
            }
        }
    }
}

sealed class MarketUiState {
    data object Loading : MarketUiState()
    data class Success(
        val categories: List<CategoriesListModel>,
        val stores: List<StoreModel>,
    ) : MarketUiState()

    data class Error(val message: String) : MarketUiState()
}
