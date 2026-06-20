package com.himanshu_kumar.shoppingapp.ui.feature.store

import com.himanshu_kumar.domain.model.ProductCategory
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.StoreModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.repository.StoreRepository
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.domain.usecase.GetStoreBySlugUseCase
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

@OptIn(ExperimentalCoroutinesApi::class)
class StoreProfileViewModelTest {
    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun loadsStoreAndProducts() = runTest {
        val store = StoreModel(
            id = 2,
            name = "CoolAir",
            slug = "coolair",
            logo = "",
            description = "HVAC",
        )
        val product = ProductListModel(
            category = ProductCategory(
                creationAt = "",
                id = 1,
                image = "",
                name = "Fans",
                slug = "fans",
                updatedAt = "",
            ),
            description = "Fan",
            id = 10,
            images = emptyList(),
            price = 500,
            slug = "fan-1",
            title = "Fan",
        )
        val storeRepo = object : StoreRepository {
            override suspend fun getStores(): ResultWrapper<List<StoreModel>> =
                ResultWrapper.Success(emptyList())
            override suspend fun getStoreBySlug(slug: String) = ResultWrapper.Success(store)
            override suspend fun submitApplication(request: com.himanshu_kumar.domain.model.StoreApplicationRequest) =
                ResultWrapper.Failure("unused")
        }
        val getStore = GetStoreBySlugUseCase(storeRepo)
        val getProducts = GetProductUseCase(object : com.himanshu_kumar.domain.repository.ProductRepository {
            override suspend fun getProducts(
                category: Int?,
                limit: Int?,
                skip: Int?,
                query: String?,
                storeSlug: String?,
            ) = ResultWrapper.Success(listOf(product))
        })

        val vm = StoreProfileViewModel(getStore, getProducts, "coolair")
        val state = vm.uiState.value
        assertTrue(state is StoreProfileUiState.Success)
        val success = state as StoreProfileUiState.Success
        assertEquals("CoolAir", success.store.name)
        assertEquals(1, success.products.size)
    }
}
