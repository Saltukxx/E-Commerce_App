package com.himanshu_kumar.shoppingapp.ui.feature.summary

import com.himanshu_kumar.domain.model.AddressDomainModel
import com.himanshu_kumar.domain.model.CartItemModel
import com.himanshu_kumar.domain.model.CartModel
import com.himanshu_kumar.domain.model.CartSummary
import com.himanshu_kumar.domain.model.OrdersListModel
import com.himanshu_kumar.domain.model.SummaryData
import com.himanshu_kumar.domain.model.request.AddCartRequestModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.CartRepository
import com.himanshu_kumar.domain.repository.OrderRepository
import com.himanshu_kumar.domain.usecase.CartSummaryUseCase
import com.himanshu_kumar.domain.usecase.PlaceOrderUseCase
import com.himanshu_kumar.shoppingapp.UserSession
import com.himanshu_kumar.shoppingapp.model.UserAddress
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class CartSummaryViewModelTest {

    @OptIn(ExperimentalCoroutinesApi::class)
    private val testDispatcher = UnconfinedTestDispatcher()

    @OptIn(ExperimentalCoroutinesApi::class)
    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `unauthenticated summary does not call repositories`() = runTest {
        val cartRepository = FakeCartRepository()
        val orderRepository = FakeOrderRepository()
        val viewModel = summaryViewModel(cartRepository, orderRepository, userId = 0)

        viewModel.placeOrder(address())

        assertTrue(viewModel.uiState.value is CartSummaryEvent.Error)
        assertNull(cartRepository.summaryUserId)
        assertNull(orderRepository.placeOrderUserId)
    }

    @Test
    fun `place order success emits order id`() = runTest {
        val cartRepository = FakeCartRepository()
        val orderRepository = FakeOrderRepository(placeOrderResult = ResultWrapper.Success(42))
        val viewModel = summaryViewModel(cartRepository, orderRepository, userId = 9)

        viewModel.placeOrder(address())

        val state = viewModel.uiState.value
        assertTrue(state is CartSummaryEvent.PlaceOrder)
        assertEquals(42, (state as CartSummaryEvent.PlaceOrder).orderId)
        assertEquals(9L, orderRepository.placeOrderUserId)
    }

    @Test
    fun `place order failure surfaces backend message`() = runTest {
        val cartRepository = FakeCartRepository()
        val orderRepository = FakeOrderRepository(placeOrderResult = ResultWrapper.Failure("Cart is empty"))
        val viewModel = summaryViewModel(cartRepository, orderRepository, userId = 9)

        viewModel.placeOrder(address())

        val state = viewModel.uiState.value
        assertTrue(state is CartSummaryEvent.Error)
        assertEquals("Cart is empty", (state as CartSummaryEvent.Error).message)
    }

    private fun summaryViewModel(
        cartRepository: FakeCartRepository,
        orderRepository: FakeOrderRepository,
        userId: Int,
    ) = CartSummaryViewModel(
        cartSummaryUseCase = CartSummaryUseCase(cartRepository),
        placeOrderUseCase = PlaceOrderUseCase(orderRepository),
        appSession = FakeUserSession(userId),
    )

    private fun address() = UserAddress(
        addressLine = "Street 1",
        city = "Berlin",
        state = "Berlin",
        postalCode = "10115",
        country = "DE",
    )

    private class FakeUserSession(private val userId: Int) : UserSession {
        override fun getUser(): Int = userId
    }

    private class FakeCartRepository : CartRepository {
        var summaryUserId: Long? = null

        override suspend fun addProductToCart(
            request: AddCartRequestModel,
            userId: Long,
        ): ResultWrapper<CartModel> = ResultWrapper.Success(CartModel(emptyList(), "Cart"))

        override suspend fun getCart(userId: Long): ResultWrapper<CartModel> =
            ResultWrapper.Success(CartModel(emptyList(), "Cart"))

        override suspend fun updateQuantity(
            cartItemModel: CartItemModel,
            userId: Long,
        ): ResultWrapper<CartModel> = ResultWrapper.Success(CartModel(listOf(cartItemModel), "Cart"))

        override suspend fun deleteItem(cartItemId: Int, userId: Long): ResultWrapper<CartModel> =
            ResultWrapper.Success(CartModel(emptyList(), "Cart"))

        override suspend fun getSummary(userId: Long): ResultWrapper<CartSummary> {
            summaryUserId = userId
            return ResultWrapper.Success(
                CartSummary(
                    data = SummaryData(
                        discount = 0.0,
                        items = emptyList(),
                        shipping = 0.0,
                        subtotal = 0.0,
                        tax = 0.0,
                        total = 0.0,
                    ),
                    msg = "Checkout Summary",
                ),
            )
        }
    }

    private class FakeOrderRepository(
        private val placeOrderResult: ResultWrapper<Long> = ResultWrapper.Success(1),
    ) : OrderRepository {
        var placeOrderUserId: Long? = null

        override suspend fun placeOrder(
            addressDomainModel: AddressDomainModel,
            userId: Long,
        ): ResultWrapper<Long> {
            placeOrderUserId = userId
            return placeOrderResult
        }

        override suspend fun getOrderList(userId: Long): ResultWrapper<OrdersListModel> =
            ResultWrapper.Success(OrdersListModel(emptyList(), "OrderList"))
    }
}
