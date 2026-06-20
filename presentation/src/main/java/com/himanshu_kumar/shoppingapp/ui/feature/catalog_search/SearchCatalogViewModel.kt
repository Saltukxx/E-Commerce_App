package com.himanshu_kumar.shoppingapp.ui.feature.catalog_search

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.search.CatalogSearch
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class SearchCatalogViewModel(
    private val useCase: GetProductUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow<SearchCatalogUiState>(SearchCatalogUiState.Prompt)
    val uiState: StateFlow<SearchCatalogUiState> = _uiState

    private var apiQuery: String = ""
    private var nextSkip = 0
    private val loaded = ArrayList<ProductListModel>()
    private var searchJob: Job? = null

    fun onDebouncedQuery(rawInput: String) {
        val normalized = CatalogSearch.normalizeQuery(rawInput)
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            if (normalized.length < CatalogSearch.MIN_SERVER_QUERY_LEN) {
                apiQuery = ""
                nextSkip = 0
                loaded.clear()
                _uiState.value = SearchCatalogUiState.Prompt
                return@launch
            }

            apiQuery = normalized
            nextSkip = 0
            loaded.clear()
            _uiState.value = SearchCatalogUiState.Loading

            when (val result = useCase.execute(null, PAGE_SIZE, 0, normalized)) {
                is ResultWrapper.Success -> {
                    val page = result.value
                    loaded.addAll(page)
                    nextSkip = loaded.size
                    val hasMore = page.size == PAGE_SIZE
                    _uiState.value = SearchCatalogUiState.Success(
                        data = loaded.toList(),
                        hasMore = hasMore,
                        isLoadingMore = false,
                        loadMoreError = null,
                    )
                }
                is ResultWrapper.Failure -> {
                    _uiState.value = SearchCatalogUiState.Error(result.message)
                }
            }
        }
    }

    fun loadNextPage() {
        val cur = _uiState.value
        if (cur !is SearchCatalogUiState.Success) return
        if (!cur.hasMore || cur.isLoadingMore || apiQuery.length < CatalogSearch.MIN_SERVER_QUERY_LEN) return

        viewModelScope.launch {
            _uiState.value = cur.copy(isLoadingMore = true, loadMoreError = null)
            when (val result = useCase.execute(null, PAGE_SIZE, nextSkip, apiQuery)) {
                is ResultWrapper.Success -> {
                    val page = result.value
                    loaded.addAll(page)
                    nextSkip = loaded.size
                    val hasMore = page.size == PAGE_SIZE
                    _uiState.value = SearchCatalogUiState.Success(
                        data = loaded.toList(),
                        hasMore = hasMore,
                        isLoadingMore = false,
                        loadMoreError = null,
                    )
                }
                is ResultWrapper.Failure -> {
                    _uiState.value = cur.copy(
                        isLoadingMore = false,
                        loadMoreError = result.message,
                    )
                }
            }
        }
    }

    companion object {
        const val PAGE_SIZE = 30
    }
}

sealed class SearchCatalogUiState {
    data object Prompt : SearchCatalogUiState()

    data object Loading : SearchCatalogUiState()

    data class Success(
        val data: List<ProductListModel>,
        val hasMore: Boolean,
        val isLoadingMore: Boolean,
        val loadMoreError: String? = null,
    ) : SearchCatalogUiState()

    data class Error(val message: String) : SearchCatalogUiState()
}
