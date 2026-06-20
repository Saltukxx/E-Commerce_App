package com.himanshu_kumar.data.repository

import com.himanshu_kumar.domain.model.AddressDomainModel
import com.himanshu_kumar.domain.model.OrderGroupResult
import com.himanshu_kumar.domain.model.OrdersListModel
import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.OrderRepository

class OrderRepositoryImpl(private val networkService: NetworkService) : OrderRepository {
    override suspend fun placeOrder(
        addressDomainModel: AddressDomainModel,
        userId: Long,
    ): ResultWrapper<OrderGroupResult> {
        return networkService.placeOrder(addressDomainModel, userId)
    }

    override suspend fun getOrderList(userId: Long): ResultWrapper<OrdersListModel> {
        return networkService.getOrderList(userId)
    }
}
