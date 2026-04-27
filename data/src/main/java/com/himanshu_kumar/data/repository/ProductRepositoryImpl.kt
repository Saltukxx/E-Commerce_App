package com.himanshu_kumar.data.repository

import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.ProductRepository

class ProductRepositoryImpl(private val networkService: NetworkService) : ProductRepository {
    override suspend fun getProducts(
        category: Int?,
        limit: Int?,
        skip: Int?,
    ): ResultWrapper<List<ProductListModel>> {
        return networkService.getProducts(category, limit, skip)
    }
}