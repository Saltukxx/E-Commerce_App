package com.himanshu_kumar.data.repository

import com.himanshu_kumar.domain.model.StoreApplicationRequest
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.StoreRepository

class StoreRepositoryImpl(private val networkService: NetworkService) : StoreRepository {
    override suspend fun getStores(): ResultWrapper<List<StoreModel>> {
        return networkService.getStores()
    }

    override suspend fun getStoreBySlug(slug: String): ResultWrapper<StoreModel> {
        return networkService.getStoreBySlug(slug)
    }

    override suspend fun submitApplication(
        request: StoreApplicationRequest,
    ): ResultWrapper<String> {
        return networkService.submitStoreApplication(request)
    }
}
