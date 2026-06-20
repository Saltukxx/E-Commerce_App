package com.himanshu_kumar.domain.repository

import com.himanshu_kumar.domain.model.StoreApplicationRequest
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.network.ResultWrapper

interface StoreRepository {
    suspend fun getStores(): ResultWrapper<List<StoreModel>>
    suspend fun getStoreBySlug(slug: String): ResultWrapper<StoreModel>
    suspend fun submitApplication(request: StoreApplicationRequest): ResultWrapper<String>
}
