package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.repository.StoreRepository

class GetStoreBySlugUseCase(private val repository: StoreRepository) {
    suspend fun execute(slug: String) = repository.getStoreBySlug(slug)
}
