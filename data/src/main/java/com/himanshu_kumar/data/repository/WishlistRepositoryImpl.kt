package com.himanshu_kumar.data.repository

import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.WishlistRepository

class WishlistRepositoryImpl(private val networkService: NetworkService) : WishlistRepository {
    override suspend fun getWishlist(userId: Long): ResultWrapper<List<ProductListModel>> =
        networkService.getWishlist(userId)

    override suspend fun add(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> =
        networkService.addToWishlist(userId, productId)

    override suspend fun remove(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> =
        networkService.removeFromWishlist(userId, productId)
}
