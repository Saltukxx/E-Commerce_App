package com.himanshu_kumar.shoppingapp.ui.feature.category_list

import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.ProductRepository
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class CategoryItemsListViewModelTest {

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
    fun `empty backend result is a successful empty category`() = runTest {
        val repository = FakeProductRepository(ResultWrapper.Success(emptyList()))
        val viewModel = CategoryItemsListViewModel(GetProductUseCase(repository))

        viewModel.getProductsWithCategory(5)

        val state = viewModel.uiState.value
        assertTrue(state is CategoryItemsListUIEvents.Success)
        assertEquals(emptyList<ProductListModel>(), (state as CategoryItemsListUIEvents.Success).data)
        assertEquals(5, repository.requestedCategory)
    }

    @Test
    fun `backend failure remains an error`() = runTest {
        val repository = FakeProductRepository(ResultWrapper.Failure("Network unavailable"))
        val viewModel = CategoryItemsListViewModel(GetProductUseCase(repository))

        viewModel.getProductsWithCategory(5)

        val state = viewModel.uiState.value
        assertTrue(state is CategoryItemsListUIEvents.Error)
        assertEquals("Network unavailable", (state as CategoryItemsListUIEvents.Error).message)
    }

    private class FakeProductRepository(
        private val result: ResultWrapper<List<ProductListModel>>,
    ) : ProductRepository {
        var requestedCategory: Int? = null

        override suspend fun getProducts(
            category: Int?,
            limit: Int?,
            skip: Int?,
        ): ResultWrapper<List<ProductListModel>> {
            requestedCategory = category
            return result
        }
    }
}
