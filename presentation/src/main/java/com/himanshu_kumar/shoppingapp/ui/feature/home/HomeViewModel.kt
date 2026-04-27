package com.himanshu_kumar.shoppingapp.ui.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetCategoriesUserCase
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.shoppingapp.AppSession
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class HomeViewModel(
    private val getProductUseCase: GetProductUseCase,
    private val categoryUseCase: GetCategoriesUserCase,
    private val appSession: AppSession,
) : ViewModel() {

    private val _uiState = MutableStateFlow<HomeScreenUIEvents>(HomeScreenUIEvents.Loading)
    val uiState: MutableStateFlow<HomeScreenUIEvents> = _uiState

    private val _userDetails = MutableStateFlow<UserDomainModel?>(null)
    val userDetails = _userDetails

    init {
        loadHome()
        getUserDetail()
    }

    private fun loadHome() {
        viewModelScope.launch {
            _uiState.value = HomeScreenUIEvents.Loading
            val (catalog, categories) = coroutineScope {
                val catalogJob = async {
                    fetchProducts(
                        category = null,
                        limit = HOME_CATALOG_FETCH_LIMIT,
                        skip = 0,
                    )
                }
                val categoriesJob = async { getCategories() }
                catalogJob.await() to categoriesJob.await()
            }

            val featured = catalog.take(HOME_ROW_LIMIT)
            val popularProducts = popularSlice(catalog)
            if (featured.isEmpty() && popularProducts.isEmpty() && categories.isEmpty()) {
                _uiState.value = HomeScreenUIEvents.Error("Something went wrong")
                return@launch
            }
            _uiState.value = HomeScreenUIEvents.Success(featured, popularProducts, categories)
        }
    }

    /** Second row: prefer a disjoint tail slice when the catalog is large; otherwise newest-first. */
    private fun popularSlice(catalog: List<ProductListModel>): List<ProductListModel> {
        if (catalog.size > HOME_ROW_LIMIT) {
            return catalog.takeLast(HOME_ROW_LIMIT)
        }
        return catalog.sortedByDescending { it.id }.take(HOME_ROW_LIMIT)
    }

    private suspend fun getCategories(): List<CategoriesListModel> {
        categoryUseCase.execute().let { result ->
            when (result) {
                is ResultWrapper.Success -> return result.value
                is ResultWrapper.Failure -> return emptyList()
            }
        }
    }

    private suspend fun fetchProducts(
        category: Int?,
        limit: Int? = null,
        skip: Int? = null,
    ): List<ProductListModel> {
        getProductUseCase.execute(category, limit, skip).let { result ->
            when (result) {
                is ResultWrapper.Success -> return result.value
                is ResultWrapper.Failure -> return emptyList()
            }
        }
    }

    private fun getUserDetail() {
        _userDetails.value = appSession.getUserDetails()
    }

    companion object {
        const val HOME_ROW_LIMIT = 18
        private const val HOME_CATALOG_FETCH_LIMIT = 120
    }
}

sealed class HomeScreenUIEvents {
    data object Loading : HomeScreenUIEvents()
    data class Success(
        val featured: List<ProductListModel>,
        val popularProducts: List<ProductListModel>,
        val categories: List<CategoriesListModel>,
    ) : HomeScreenUIEvents()
    data class Error(val message: String) : HomeScreenUIEvents()
}
