package com.himanshu_kumar.domain.repository

import com.himanshu_kumar.domain.model.AddressDomainModel
import com.himanshu_kumar.domain.model.CheckoutConfigModel
import com.himanshu_kumar.domain.model.CheckoutSessionModel
import com.himanshu_kumar.domain.model.OrderGroupResult
import com.himanshu_kumar.domain.network.ResultWrapper

interface CheckoutRepository {
    suspend fun getConfig(): ResultWrapper<CheckoutConfigModel>
    suspend fun createSession(
        address: AddressDomainModel,
        userId: Long,
    ): ResultWrapper<CheckoutSessionModel>
    suspend fun waitForPaidCheckout(
        checkoutId: Int,
        userId: Long,
    ): ResultWrapper<OrderGroupResult>
}
