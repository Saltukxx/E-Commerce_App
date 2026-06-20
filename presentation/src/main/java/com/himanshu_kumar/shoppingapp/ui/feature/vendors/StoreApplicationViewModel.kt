package com.himanshu_kumar.shoppingapp.ui.feature.vendors

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.StoreApplicationRequest
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.SubmitStoreApplicationUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class StoreApplicationViewModel(
    private val submitStoreApplicationUseCase: SubmitStoreApplicationUseCase,
) : ViewModel() {

    private val _uiState = MutableStateFlow<StoreApplicationUiState>(StoreApplicationUiState.Idle)
    val uiState: StateFlow<StoreApplicationUiState> = _uiState

    fun submit(request: StoreApplicationRequest) {
        viewModelScope.launch {
            _uiState.value = StoreApplicationUiState.Loading
            when (val result = submitStoreApplicationUseCase.execute(request)) {
                is ResultWrapper.Success -> {
                    _uiState.value = StoreApplicationUiState.Success(result.value)
                }
                is ResultWrapper.Failure -> {
                    _uiState.value = StoreApplicationUiState.Error(result.message)
                }
            }
        }
    }
}

sealed class StoreApplicationUiState {
    data object Idle : StoreApplicationUiState()
    data object Loading : StoreApplicationUiState()
    data class Success(val message: String) : StoreApplicationUiState()
    data class Error(val message: String) : StoreApplicationUiState()
}
