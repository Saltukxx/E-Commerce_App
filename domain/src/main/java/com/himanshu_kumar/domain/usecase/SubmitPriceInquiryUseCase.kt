package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.network.NetworkService

class SubmitPriceInquiryUseCase(private val networkService: NetworkService) {
    suspend fun execute(productId: Int) = networkService.submitPriceInquiry(productId)
}
