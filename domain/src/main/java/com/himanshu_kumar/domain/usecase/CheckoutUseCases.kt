package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.model.AddressDomainModel
import com.himanshu_kumar.domain.repository.CheckoutRepository

class GetCheckoutConfigUseCase(private val repository: CheckoutRepository) {
    suspend fun execute() = repository.getConfig()
}

class CreateCheckoutSessionUseCase(private val repository: CheckoutRepository) {
    suspend fun execute(address: AddressDomainModel, userId: Long) =
        repository.createSession(address, userId)
}

class PollCheckoutStatusUseCase(private val repository: CheckoutRepository) {
    suspend fun execute(checkoutId: Int, userId: Long) =
        repository.waitForPaidCheckout(checkoutId, userId)
}
