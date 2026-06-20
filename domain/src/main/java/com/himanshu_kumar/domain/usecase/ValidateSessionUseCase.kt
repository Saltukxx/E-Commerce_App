package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper

class ValidateSessionUseCase(private val networkService: NetworkService) {
    suspend fun execute(): Boolean {
        return when (val result = networkService.validateStoredSession()) {
            is ResultWrapper.Success -> result.value
            is ResultWrapper.Failure -> false
        }
    }
}
