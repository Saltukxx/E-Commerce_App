package com.himanshu_kumar.shoppingapp.ui.feature.product_details

import com.himanshu_kumar.domain.model.CartModel
import com.himanshu_kumar.domain.model.CartSummary
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.SummaryData
import com.himanshu_kumar.domain.model.request.AddCartRequestModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.CartRepository
import com.himanshu_kumar.domain.repository.ProductRepository
import com.himanshu_kumar.domain.repository.WishlistRepository
import com.himanshu_kumar.domain.usecase.AddToCartUseCase
import com.himanshu_kumar.domain.usecase.AddToWishlistUseCase
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.domain.usecase.GetWishlistUseCase
import com.himanshu_kumar.domain.usecase.RemoveFromWishlistUseCase
import com.himanshu_kumar.shoppingapp.UserSession
import com.himanshu_kumar.shoppingapp.model.UiProductModel
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

class ProductDetailsViewModelTest {

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
    fun `unauthenticated add to cart does not call repository`() = runTest {
        val cartRepository = FakeCartRepository()
        val viewModel = productDetailsViewModel(cartRepository, userId = 0)

        viewModel.addProductToCart(product(), navigateToCheckout = false)

        assertTrue(viewModel.state.value is ProductDetailsState.Error)
        assertNull(cartRepository.addedRequest)
    }

    @Test
    fun `add to cart sends backend request for authenticated user`() = runTest {
        val cartRepository = FakeCartRepository()
        val viewModel = productDetailsViewModel(cartRepository, userId = 7)

        viewModel.addProductToCart(product(), navigateToCheckout = false)

        assertEquals(7L, cartRepository.addedUserId)
        assertEquals(
            AddCartRequestModel(
                productId = 12,
                productName = "Coffee",
                price = 99,
                quantity = 1,
                userId = 7,
            ),
            cartRepository.addedRequest,
        )
        val success = viewModel.state.value as ProductDetailsState.Success
        assertTrue(!success.navigateToCheckout)
    }

    private fun productDetailsViewModel(
        cartRepository: FakeCartRepository,
        userId: Int,
    ) = ProductDetailsViewModel(
        useCase = AddToCartUseCase(cartRepository),
        getProductUseCase = GetProductUseCase(FakeProductRepository()),
        appSession = FakeUserSession(userId),
        getWishlistUseCase = GetWishlistUseCase(FakeWishlistRepository()),
        addToWishlistUseCase = AddToWishlistUseCase(FakeWishlistRepository()),
        removeFromWishlistUseCase = RemoveFromWishlistUseCase(FakeWishlistRepository()),
    )

    private fun product() = UiProductModel(
        categoryId = 3,
        id = 12,
        title = "Coffee",
        price = 99,
        description = "Test product",
        images = emptyList(),
    )

    private class FakeUserSession(private val userId: Int) : UserSession {
        override fun getUser(): Int = userId
    }

    private class FakeProductRepository : ProductRepository {
        override suspend fun getProducts(
            category: Int?,
            limit: Int?,
            skip: Int?,
        ): ResultWrapper<List<ProductListModel>> =
            ResultWrapper.Success(emptyList())
    }

    private class FakeWishlistRepository : WishlistRepository {
        override suspend fun getWishlist(userId: Long): ResultWrapper<List<ProductListModel>> =
            ResultWrapper.Success(emptyList())

        override suspend fun add(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> =
            ResultWrapper.Success(emptyList())

        override suspend fun remove(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> =
            ResultWrapper.Success(emptyList())
    }

    private class FakeCartRepository : CartRepository {
        var addedRequest: AddCartRequestModel? = null
        var addedUserId: Long? = null

        override suspend fun addProductToCart(
            request: AddCartRequestModel,
            userId: Long,
        ): ResultWrapper<CartModel> {
            addedRequest = request
            addedUserId = userId
            return ResultWrapper.Success(CartModel(emptyList(), "Cart"))
        }

        override suspend fun getCart(userId: Long): ResultWrapper<CartModel> =
            ResultWrapper.Success(CartModel(emptyList(), "Cart"))

        override suspend fun updateQuantity(
            cartItemModel: com.himanshu_kumar.domain.model.CartItemModel,
            userId: Long,
        ): ResultWrapper<CartModel> = ResultWrapper.Success(CartModel(listOf(cartItemModel), "Cart"))

        override suspend fun deleteItem(cartItemId: Int, userId: Long): ResultWrapper<CartModel> =
            ResultWrapper.Success(CartModel(emptyList(), "Cart"))

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
