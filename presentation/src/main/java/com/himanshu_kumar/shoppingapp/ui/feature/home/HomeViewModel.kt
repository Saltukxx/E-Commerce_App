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
import kotlinx.coroutines.awaitAll
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
            val popularProducts = disjointPopular(catalog, featured)

            if (featured.isEmpty() && popularProducts.isEmpty() && categories.isEmpty()) {
                _uiState.value = HomeScreenUIEvents.Error("Something went wrong")
                return@launch
            }
            // First paint: show featured, popular, categories; fill previews/Embraco in a follow-up.
            _uiState.value = HomeScreenUIEvents.Success(
                featured = featured,
                popularProducts = popularProducts,
                categories = categories,
                categoryPreviews = emptyList(),
                embracoCategory = null,
                embracoProducts = emptyList(),
            )

            if (categories.isEmpty()) return@launch

            val (categoryPreviews, embracoCategory, embracoProducts) = coroutineScope {
                val embracoCat = categories.firstOrNull { it.slug == EMBRACO_SLUG }
                val picked = categories
                    .filter { it.slug != EMBRACO_SLUG }
                    .take(CATEGORY_PREVIEW_COUNT)
                val previewDeferreds = picked.map { cat ->
                    async {
                        CategoryPreview(
                            category = cat,
                            products = fetchProducts(
                                category = cat.id,
                                limit = HOME_CATEGORY_ROW_LIMIT,
                                skip = 0,
                            ),
                        )
                    }
                }
                val previewResults = previewDeferreds.awaitAll()
                val embrList = if (embracoCat != null) {
                    async {
                        fetchProducts(
                            category = embracoCat.id,
                            limit = EMBRACO_ROW_LIMIT,
                            skip = 0,
                        )
                    }.await()
                } else {
                    emptyList()
                }
                Triple(previewResults, embracoCat, embrList)
            }

            _uiState.value = HomeScreenUIEvents.Success(
                featured = featured,
                popularProducts = popularProducts,
                categories = categories,
                categoryPreviews = categoryPreviews,
                embracoCategory = embracoCategory,
                embracoProducts = embracoProducts,
            )
        }
    }

    /**
     * Beliebt: prefer the slice of [catalog] after [featured] so it does not repeat Empfohlen;
     * if too few remain, use products not in [featured] by id, newest first.
     */
    private fun disjointPopular(
        catalog: List<ProductListModel>,
        featured: List<ProductListModel>,
    ): List<ProductListModel> {
        val tail = catalog.drop(featured.size).take(HOME_ROW_LIMIT)
        if (tail.isNotEmpty()) return tail
        val featuredIds = featured.map { it.id }.toSet()
        return catalog
            .filter { it.id !in featuredIds }
            .sortedByDescending { it.id }
            .take(HOME_ROW_LIMIT)
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
        private const val HOME_CATALOG_FETCH_LIMIT = 80
        private const val EMBRACO_SLUG = "embraco-compressors"
        private const val CATEGORY_PREVIEW_COUNT = 3
        private const val HOME_CATEGORY_ROW_LIMIT = 12
        private const val EMBRACO_ROW_LIMIT = 18
    }
}

data class CategoryPreview(
    val category: CategoriesListModel,
    val products: List<ProductListModel>,
)

sealed class HomeScreenUIEvents {
    data object Loading : HomeScreenUIEvents()
    data class Success(
        val featured: List<ProductListModel>,
        val popularProducts: List<ProductListModel>,
        val categories: List<CategoriesListModel>,
        val categoryPreviews: List<CategoryPreview>,
        val embracoCategory: CategoriesListModel?,
        val embracoProducts: List<ProductListModel>,
    ) : HomeScreenUIEvents()
    data class Error(val message: String) : HomeScreenUIEvents()
}
