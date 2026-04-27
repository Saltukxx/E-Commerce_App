package com.himanshu_kumar.domain.repository


import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper

interface ProductRepository {
    suspend fun getProducts(
        category: Int?,
        limit: Int? = null,
        skip: Int? = null,
    ): ResultWrapper<List<ProductListModel>>
}