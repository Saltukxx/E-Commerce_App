package com.himanshu_kumar.domain.usecase

import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.WishlistRepository

class RemoveFromWishlistUseCase(private val repository: WishlistRepository) {
    suspend fun execute(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> =
        repository.remove(userId, productId)
}
