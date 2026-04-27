package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.repository.ProductRepository

class GetProductUseCase(private val repository: ProductRepository) {
    suspend fun execute(
        category: Int?,
        limit: Int? = null,
        skip: Int? = null,
    ) = repository.getProducts(category, limit, skip)
}