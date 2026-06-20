package com.himanshu_kumar.data.repository

import com.himanshu_kumar.domain.model.AddressDomainModel
import com.himanshu_kumar.domain.model.CheckoutConfigModel
import com.himanshu_kumar.domain.model.CheckoutSessionModel
import com.himanshu_kumar.domain.model.OrderGroupResult
import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.CheckoutRepository
import kotlinx.coroutines.delay

class CheckoutRepositoryImpl(
    private val networkService: NetworkService,
) : CheckoutRepository {
    override suspend fun getConfig(): ResultWrapper<CheckoutConfigModel> =
        networkService.getCheckoutConfig()

    override suspend fun createSession(
        address: AddressDomainModel,
        userId: Long,
    ): ResultWrapper<CheckoutSessionModel> =
        networkService.createCheckoutSession(address, userId)

    override suspend fun waitForPaidCheckout(
        checkoutId: Int,
        userId: Long,
    ): ResultWrapper<OrderGroupResult> {
        repeat(POLL_ATTEMPTS) {
            when (val status = networkService.getCheckoutStatus(userId, checkoutId)) {
                is ResultWrapper.Success -> {
                    status.value.orderGroupResult?.let {
                        return ResultWrapper.Success(it)
                    }
                }
                is ResultWrapper.Failure -> return status
            }
            delay(POLL_DELAY_MS)
        }
        return ResultWrapper.Failure("Payment confirmation timed out — check your orders shortly")
    }

    private companion object {
        const val POLL_ATTEMPTS = 15
        const val POLL_DELAY_MS = 2_000L
    }
}
