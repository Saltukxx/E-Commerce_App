package com.himanshu_kumar.shoppingapp.ui.feature.vendors

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetStoresUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class VendorListViewModel(
    private val getStoresUseCase: GetStoresUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow<VendorListUiState>(VendorListUiState.Loading)
    val uiState: StateFlow<VendorListUiState> = _uiState

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = VendorListUiState.Loading
            when (val result = getStoresUseCase.execute()) {
                is ResultWrapper.Success -> {
                    _uiState.value = VendorListUiState.Success(result.value)
                }
                is ResultWrapper.Failure -> {
                    _uiState.value = VendorListUiState.Error(result.message)
                }
            }
        }
    }
}

sealed class VendorListUiState {
    data object Loading : VendorListUiState()
    data class Success(val stores: List<StoreModel>) : VendorListUiState()
    data class Error(val message: String) : VendorListUiState()
}
