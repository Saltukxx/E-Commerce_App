package com.himanshu_kumar.shoppingapp.ui.feature.summary



import androidx.lifecycle.ViewModel

import androidx.lifecycle.viewModelScope

import com.himanshu_kumar.domain.model.CartSummary

import com.himanshu_kumar.domain.model.CheckoutSessionModel

import com.himanshu_kumar.domain.model.OrderGroupResult

import com.himanshu_kumar.domain.network.ResultWrapper

import com.himanshu_kumar.domain.usecase.CartSummaryUseCase

import com.himanshu_kumar.domain.usecase.CreateCheckoutSessionUseCase

import com.himanshu_kumar.domain.usecase.GetCheckoutConfigUseCase

import com.himanshu_kumar.domain.usecase.PlaceOrderUseCase

import com.himanshu_kumar.domain.usecase.PollCheckoutStatusUseCase

import com.himanshu_kumar.shoppingapp.UserSession

import com.himanshu_kumar.shoppingapp.BuildConfig

import com.himanshu_kumar.shoppingapp.model.UserAddress

import kotlinx.coroutines.flow.MutableStateFlow

import kotlinx.coroutines.flow.asStateFlow

import kotlinx.coroutines.launch



class CartSummaryViewModel(

    private val cartSummaryUseCase: CartSummaryUseCase,

    private val placeOrderUseCase: PlaceOrderUseCase,

    private val getCheckoutConfigUseCase: GetCheckoutConfigUseCase,

    private val createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,

    private val pollCheckoutStatusUseCase: PollCheckoutStatusUseCase,

    private val appSession: UserSession,

) : ViewModel() {

    private val _uiState = MutableStateFlow<CartSummaryEvent>(CartSummaryEvent.Loading)

    val uiState = _uiState



    private val _paymentsEnabled = MutableStateFlow(false)

    val paymentsEnabled = _paymentsEnabled.asStateFlow()



    private val _paymentSession = MutableStateFlow<CheckoutSessionModel?>(null)

    val paymentSession = _paymentSession.asStateFlow()



    val userId = appSession.getUser().toLong()



    init {

        viewModelScope.launch {

            when (val config = getCheckoutConfigUseCase.execute()) {

                is ResultWrapper.Success -> _paymentsEnabled.value = config.value.paymentsEnabled

                is ResultWrapper.Failure -> _paymentsEnabled.value = false

            }

            getCartSummary(userId)

        }

    }



    fun getSavedAddress(): UserAddress? = appSession.getSavedAddress()



    fun saveAddress(userAddress: UserAddress) {

        appSession.storeSavedAddress(userAddress)

    }



    private fun getCartSummary(userId: Long) {

        if (userId == 0L) {

            _uiState.value = CartSummaryEvent.Error("Please log in first")

            return

        }

        viewModelScope.launch {

            _uiState.value = CartSummaryEvent.Loading

            when (val summary = cartSummaryUseCase.execute(userId)) {

                is ResultWrapper.Success -> {

                    _uiState.value = CartSummaryEvent.Success(summary.value)

                }

                is ResultWrapper.Failure -> {

                    _uiState.value = CartSummaryEvent.Error(summary.message)

                }

            }

        }

    }



    fun placeOrder(userAddress: UserAddress) {

        if (userId == 0L) {

            _uiState.value = CartSummaryEvent.Error("Please log in first")

            return

        }

        if (_paymentsEnabled.value && BuildConfig.STRIPE_PAYMENTS_ENABLED) {

            startCardCheckout(userAddress)

        } else {

            submitOrderWithoutPayment(userAddress)

        }

    }



    fun onPaymentSheetResult(completed: Boolean, checkoutId: Int) {

        _paymentSession.value = null

        if (!completed) {

            _uiState.value = CartSummaryEvent.Error("Payment was cancelled")

            return

        }

        viewModelScope.launch {

            _uiState.value = CartSummaryEvent.Loading

            when (val result = pollCheckoutStatusUseCase.execute(checkoutId, userId)) {

                is ResultWrapper.Success -> {

                    _uiState.value = CartSummaryEvent.PlaceOrder(result.value)

                }

                is ResultWrapper.Failure -> {

                    _uiState.value = CartSummaryEvent.Error(result.message)

                }

            }

        }

    }



    private fun startCardCheckout(userAddress: UserAddress) {

        viewModelScope.launch {

            _uiState.value = CartSummaryEvent.Loading

            when (val session = createCheckoutSessionUseCase.execute(userAddress.toDomainAddress(), userId)) {

                is ResultWrapper.Success -> {

                    _paymentSession.value = session.value

                    val current = _uiState.value

                    if (current is CartSummaryEvent.Success) {

                        _uiState.value = current

                    }

                }

                is ResultWrapper.Failure -> {

                    if (session.message.contains("PAYMENTS_DISABLED", ignoreCase = true)) {

                        submitOrderWithoutPayment(userAddress)

                    } else {

                        _uiState.value = CartSummaryEvent.Error(session.message)

                    }

                }

            }

        }

    }



    private fun submitOrderWithoutPayment(userAddress: UserAddress) {

        viewModelScope.launch {

            _uiState.value = CartSummaryEvent.Loading

            when (val result = placeOrderUseCase.execute(userAddress.toDomainAddress(), userId)) {

                is ResultWrapper.Success -> {

                    _uiState.value = CartSummaryEvent.PlaceOrder(result.value)

                }

                is ResultWrapper.Failure -> {

                    _uiState.value = CartSummaryEvent.Error(result.message)

                }

            }

        }

    }

}



sealed class CartSummaryEvent {

    data object Loading : CartSummaryEvent()

    data class Error(val message: String) : CartSummaryEvent()

    data class Success(val cartSummary: CartSummary) : CartSummaryEvent()

    data class PlaceOrder(val result: OrderGroupResult) : CartSummaryEvent()

}


