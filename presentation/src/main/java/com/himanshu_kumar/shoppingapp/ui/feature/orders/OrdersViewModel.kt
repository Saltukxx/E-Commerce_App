package com.himanshu_kumar.shoppingapp.ui.feature.orders

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.OrderGroupModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.OrderListUseCase
import com.himanshu_kumar.shoppingapp.AppSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class OrdersViewModel(
    private val orderListUseCase: OrderListUseCase,
    private val appSession: AppSession,
) : ViewModel() {

    private val _orderState = MutableStateFlow<OrderEvent>(OrderEvent.Loading)
    val orderState = _orderState

    val userId = appSession.getUser().toLong()

    init {
        loadOrders(showFullscreenLoading = true)
    }

    fun refresh() {
        loadOrders(showFullscreenLoading = false)
    }

    fun retry() {
        loadOrders(showFullscreenLoading = true)
    }

    private fun loadOrders(showFullscreenLoading: Boolean) {
        viewModelScope.launch {
            if (showFullscreenLoading) {
                _orderState.value = OrderEvent.Loading
            }
            when (val result = orderListUseCase.execute(userId)) {
                is ResultWrapper.Success -> {
                    _orderState.value = OrderEvent.Success(result.value.data)
                }
                is ResultWrapper.Failure -> {
                    _orderState.value = OrderEvent.Error(result.message ?: "")
                }
            }
        }
    }
}

sealed class OrderEvent {
    data object Loading : OrderEvent()
    data class Success(val data: List<OrderGroupModel>) : OrderEvent()
    data class Error(val errorMsg: String) : OrderEvent()
}
