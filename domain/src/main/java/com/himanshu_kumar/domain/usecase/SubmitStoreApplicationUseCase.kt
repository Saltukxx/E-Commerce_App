package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.model.StoreApplicationRequest
import com.himanshu_kumar.domain.repository.StoreRepository

class SubmitStoreApplicationUseCase(private val repository: StoreRepository) {
    suspend fun execute(request: StoreApplicationRequest) = repository.submitApplication(request)
}
