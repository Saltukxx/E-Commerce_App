package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.repository.StoreRepository

class GetStoresUseCase(private val repository: StoreRepository) {
    suspend fun execute() = repository.getStores()
}
