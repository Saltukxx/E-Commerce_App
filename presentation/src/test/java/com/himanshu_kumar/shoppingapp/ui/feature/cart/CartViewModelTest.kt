package com.himanshu_kumar.shoppingapp.ui.feature.cart

import com.himanshu_kumar.domain.model.CartItemModel
import com.himanshu_kumar.domain.model.CartModel
import com.himanshu_kumar.domain.model.CartSummary
import com.himanshu_kumar.domain.model.SummaryData
import com.himanshu_kumar.domain.model.request.AddCartRequestModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.CartRepository
import com.himanshu_kumar.domain.usecase.DeleteProductUseCase
import com.himanshu_kumar.domain.usecase.GetCartUseCase
import com.himanshu_kumar.domain.usecase.UpdateQuantityUseCase
import com.himanshu_kumar.shoppingapp.UserSession
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

class CartViewModelTest {

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
    fun `initial load can return an empty cart`() = runTest {
        val repository = FakeCartRepository()
        val viewModel = cartViewModel(repository, userId = 1)

        val state = viewModel.uiState.value

        assertTrue(state is CartEvent.Success)
        assertEquals(emptyList<CartItemModel>(), (state as CartEvent.Success).data)
        assertEquals(1L, repository.getCartUserId)
    }

    @Test
    fun incrementQuantity() = runTest {
        val repository = FakeCartRepository()
        val viewModel = cartViewModel(repository, userId = 1)
        val item = cartItem(quantity = 2)

        viewModel.incrementQuantity(item)

        assertEquals(item.copy(quantity = 3), repository.updatedItem)
        assertEquals(1L, repository.updatedUserId)
    }

    @Test
    fun decrementQuantity() = runTest {
        val repository = FakeCartRepository()
        val viewModel = cartViewModel(repository, userId = 1)
        val item = cartItem(quantity = 2)

        viewModel.decrementQuantity(item)

        assertEquals(item.copy(quantity = 1), repository.updatedItem)
        assertEquals(1L, repository.updatedUserId)
    }

    @Test
    fun `unauthenticated cart does not call repository`() = runTest {
        val repository = FakeCartRepository()
        val viewModel = cartViewModel(repository, userId = 0)

        viewModel.incrementQuantity(cartItem(quantity = 2))
        viewModel.removeItem(cartItem(quantity = 2))

        assertTrue(viewModel.uiState.value is CartEvent.Error)
        assertNull(repository.getCartUserId)
        assertNull(repository.updatedItem)
        assertNull(repository.deletedCartItemId)
    }

    private fun cartViewModel(
        repository: FakeCartRepository,
        userId: Int,
    ) = CartViewModel(
        cartUseCase = GetCartUseCase(repository),
        updateQuantityUseCase = UpdateQuantityUseCase(repository),
        deleteItemUseCase = DeleteProductUseCase(repository),
        appSession = FakeUserSession(userId),
    )

    private fun cartItem(quantity: Int) = CartItemModel(
        id = 10,
        productId = 20,
        userId = 1,
        name = "",
        price = 15,
        imageUrl = null,
        quantity = quantity,
        productName = "Test product",
    )

    private class FakeUserSession(private val userId: Int) : UserSession {
        override fun getUser(): Int = userId
    }

    private class FakeCartRepository : CartRepository {
        var getCartUserId: Long? = null
        var updatedItem: CartItemModel? = null
        var updatedUserId: Long? = null
        var deletedCartItemId: Int? = null

        override suspend fun addProductToCart(
            request: AddCartRequestModel,
            userId: Long,
        ): ResultWrapper<CartModel> = ResultWrapper.Success(CartModel(emptyList(), "Cart"))

        override suspend fun getCart(userId: Long): ResultWrapper<CartModel> {
            getCartUserId = userId
            return ResultWrapper.Success(CartModel(emptyList(), "Cart"))
        }

        override suspend fun updateQuantity(
            cartItemModel: CartItemModel,
            userId: Long,
        ): ResultWrapper<CartModel> {
            updatedItem = cartItemModel
            updatedUserId = userId
            return ResultWrapper.Success(CartModel(listOf(cartItemModel), "Cart"))
        }

        override suspend fun deleteItem(cartItemId: Int, userId: Long): ResultWrapper<CartModel> {
            deletedCartItemId = cartItemId
            return ResultWrapper.Success(CartModel(emptyList(), "Cart"))
        }

        override suspend fun getSummary(userId: Long): ResultWrapper<CartSummary> =
            ResultWrapper.Success(
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
