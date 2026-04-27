package com.himanshu_kumar.domain.repository

import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper

interface WishlistRepository {
    suspend fun getWishlist(userId: Long): ResultWrapper<List<ProductListModel>>
    suspend fun add(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>>
    suspend fun remove(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>>
}
