package com.himanshu_kumar.data.network

import com.himanshu_kumar.data.model.request.AddToCartRequest
import com.himanshu_kumar.data.model.request.AddWishlistRequest
import com.himanshu_kumar.data.model.request.AddressOrderModel
import com.himanshu_kumar.data.model.request.RefreshTokenRequest
import com.himanshu_kumar.data.model.request.RegisterRequest
import com.himanshu_kumar.data.model.request.TokenRequest
import com.himanshu_kumar.data.model.response.CartResponse
import com.himanshu_kumar.data.model.response.CartSummaryResponse
import com.himanshu_kumar.data.model.response.CategoriesListResponse
import com.himanshu_kumar.data.model.response.OrdersListResponse
import com.himanshu_kumar.data.model.response.PlaceOrderResponse
import com.himanshu_kumar.data.model.response.ProductListResponse
import com.himanshu_kumar.data.model.response.RegisterResponse
import com.himanshu_kumar.data.model.response.TokenResponse
import com.himanshu_kumar.data.model.response.UserResponse
import com.himanshu_kumar.data.model.response.WishlistResponse
import com.himanshu_kumar.domain.model.AddressDomainModel
import com.himanshu_kumar.domain.model.CartItemModel
import com.himanshu_kumar.domain.model.CartModel
import com.himanshu_kumar.domain.model.CartSummary
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.domain.model.LoginResult
import com.himanshu_kumar.domain.model.OrdersListModel
import com.himanshu_kumar.domain.model.ProductListModel
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.domain.model.request.AddCartRequestModel
import com.himanshu_kumar.domain.network.NetworkService
import com.himanshu_kumar.domain.network.ResultWrapper
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.plugins.ServerResponseException
import io.ktor.client.request.header
import io.ktor.client.request.request
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpMethod
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.http.Parameters
import io.ktor.http.contentType
import io.ktor.utils.io.errors.IOException

class NetworkServiceImpl(
    private val client: HttpClient,
    private val env: NetworkEnvironment,
) : NetworkService {

    private val baseUrl: String get() = env.baseUrl.trimEnd('/')

    override suspend fun getProducts(
        category: Int?,
        limit: Int?,
        skip: Int?,
    ): ResultWrapper<List<ProductListModel>> {
        val query = buildList {
            if (category != null) add("categoryId=$category")
            if (limit != null) add("limit=$limit")
            if (skip != null) add("skip=$skip")
        }.joinToString("&").let { if (it.isEmpty()) "" else "?$it" }
        val url = "$baseUrl/products$query"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { dataModels: List<ProductListResponse> ->
                dataModels.map { it.toProductList() }
            },
        )
    }

    override suspend fun getCategories(): ResultWrapper<List<CategoriesListModel>> {
        val url = "$baseUrl/categories"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { categories: List<CategoriesListResponse> ->
                categories.map { it.toCategoryListModel() }
            },
        )
    }

    override suspend fun addProductToCart(
        request: AddCartRequestModel,
        userId: Long,
    ): ResultWrapper<CartModel> {
        val url = "$baseUrl/cart/$userId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Post,
            body = AddToCartRequest.fromCartRequestModel(request),
            mapper = { res: CartResponse -> res.toCartModel() },
        )
    }

    override suspend fun getCart(userId: Long): ResultWrapper<CartModel> {
        val url = "$baseUrl/cart/$userId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { res: CartResponse -> res.toCartModel() },
        )
    }

    override suspend fun updateQuantity(
        cartItemModel: CartItemModel,
        userId: Long,
    ): ResultWrapper<CartModel> {
        val url = "$baseUrl/cart/$userId/${cartItemModel.id}"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Put,
            body = AddToCartRequest(
                productId = cartItemModel.productId,
                productName = cartItemModel.productName,
                price = cartItemModel.price,
                quantity = cartItemModel.quantity,
                userId = cartItemModel.userId,
            ),
            mapper = { res: CartResponse -> res.toCartModel() },
        )
    }

    override suspend fun deleteItem(cartItemId: Int, userId: Long): ResultWrapper<CartModel> {
        val url = "$baseUrl/cart/$userId/$cartItemId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Delete,
            mapper = { res: CartResponse -> res.toCartModel() },
        )
    }

    override suspend fun getCartSummary(userId: Long): ResultWrapper<CartSummary> {
        val url = "$baseUrl/cart/$userId/summary"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { res: CartSummaryResponse -> res.toCartSummary() },
        )
    }

    override suspend fun placeOrder(
        address: AddressDomainModel,
        userId: Long,
    ): ResultWrapper<Long> {
        val dataModel = AddressOrderModel.fromDomainAddress(address)
        val url = "$baseUrl/orders/$userId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Post,
            body = dataModel,
            mapper = { orderRes: PlaceOrderResponse -> orderRes.data.id },
        )
    }

    override suspend fun getOrderList(userId: Long): ResultWrapper<OrdersListModel> {
        val url = "$baseUrl/orders/$userId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { orderResponse: OrdersListResponse ->
                orderResponse.toDomainResponse()
            },
        )
    }

    override suspend fun login(
        email: String,
        password: String,
    ): ResultWrapper<LoginResult> {
        val urlForToken = "$baseUrl/auth/login"
        val tokenRes = makeWebRequest<TokenResponse, TokenResponse>(
            url = urlForToken,
            method = HttpMethod.Post,
            body = TokenRequest(email, password),
            allowTokenRefresh = false,
            mapper = { it },
        )
        if (tokenRes is ResultWrapper.Failure) {
            return ResultWrapper.Failure(tokenRes.message)
        }
        val tokens = (tokenRes as ResultWrapper.Success).value
        val accessToken = tokens.access_token
        env.tokenProvider.setAccessToken(tokens.access_token)
        env.tokenProvider.setRefreshToken(tokens.refresh_token)

        val urlForProfile = "$baseUrl/auth/profile"
        val userResult = makeWebRequest<UserResponse, UserDomainModel>(
            url = urlForProfile,
            method = HttpMethod.Get,
            headers = mapOf("Authorization" to "Bearer $accessToken"),
            allowTokenRefresh = false,
            mapper = { userResponse -> userResponse.toUserDomainModel() },
        )
        if (userResult is ResultWrapper.Failure) {
            env.tokenProvider.clearAuthTokens()
            return ResultWrapper.Failure(userResult.message)
        }
        val user = (userResult as ResultWrapper.Success).value
        return ResultWrapper.Success(
            LoginResult(
                user = user,
                accessToken = accessToken,
                refreshToken = tokens.refresh_token,
            ),
        )
    }

    override suspend fun register(
        email: String,
        password: String,
        name: String,
    ): ResultWrapper<UserDomainModel> {
        val url = "$baseUrl/users"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Post,
            body = RegisterRequest(name = name, email = email, password = password),
            allowTokenRefresh = false,
            mapper = { registerResponse: RegisterResponse ->
                registerResponse.toUserDomainModel()
            },
        )
    }

    override suspend fun getProfile(): ResultWrapper<UserDomainModel> {
        val url = "$baseUrl/auth/profile"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { userResponse: UserResponse -> userResponse.toUserDomainModel() },
        )
    }

    override suspend fun logout(refreshToken: String): ResultWrapper<Unit> {
        val url = "$baseUrl/auth/logout"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Post,
            body = RefreshTokenRequest(refreshToken),
            allowTokenRefresh = false,
            mapper = { _: Map<String, String> -> Unit },
        )
    }

    override suspend fun getWishlist(userId: Long): ResultWrapper<List<ProductListModel>> {
        val url = "$baseUrl/wishlist/$userId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Get,
            mapper = { res: WishlistResponse -> res.toProducts() },
        )
    }

    override suspend fun addToWishlist(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> {
        val url = "$baseUrl/wishlist/$userId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Post,
            body = AddWishlistRequest(productId),
            mapper = { res: WishlistResponse -> res.toProducts() },
        )
    }

    override suspend fun removeFromWishlist(userId: Long, productId: Int): ResultWrapper<List<ProductListModel>> {
        val url = "$baseUrl/wishlist/$userId/$productId"
        return makeWebRequest(
            url = url,
            method = HttpMethod.Delete,
            mapper = { res: WishlistResponse -> res.toProducts() },
        )
    }

    private suspend inline fun <reified T, R> makeWebRequest(
        url: String,
        method: HttpMethod,
        body: Any? = null,
        headers: Map<String, String>? = emptyMap(),
        parameters: Map<String, String>? = emptyMap(),
        allowTokenRefresh: Boolean = true,
        noinline mapper: (T) -> R,
    ): ResultWrapper<R> {
        return try {
            val response = executeRequest<T>(url, method, body, headers, parameters)
            val result = mapper(response)
            ResultWrapper.Success(result)
        } catch (e: ClientRequestException) {
            if (e.response.status == HttpStatusCode.Unauthorized && allowTokenRefresh) {
                val refreshed = refreshAccessToken()
                if (refreshed) {
                    return try {
                        val response = executeRequest<T>(
                            url,
                            method,
                            body,
                            headers.withFreshAuthorization(),
                            parameters,
                        )
                        val result = mapper(response)
                        ResultWrapper.Success(result)
                    } catch (retryError: Exception) {
                        ResultWrapper.Failure(retryError.message ?: "Unknown error")
                    }
                }
            }
            ResultWrapper.Failure(e.message)
        } catch (e: ServerResponseException) {
            ResultWrapper.Failure(e.message)
        } catch (e: IOException) {
            ResultWrapper.Failure(e.message ?: "Unknown error")
        } catch (e: Exception) {
            ResultWrapper.Failure(e.message ?: "Unknown error")
        }
    }

    private suspend inline fun <reified T> executeRequest(
        url: String,
        method: HttpMethod,
        body: Any?,
        headers: Map<String, String>?,
        parameters: Map<String, String>?,
    ): T {
        return client.request(url) {
            this.method = method
            url {
                this.parameters.appendAll(Parameters.build {
                    parameters?.forEach { (key, value) ->
                        append(key, value)
                    }
                })
            }
            headers?.forEach { (key, value) ->
                header(key, value)
            }
            if (body != null) {
                setBody(body)
            }
            contentType(ContentType.Application.Json)
        }.body()
    }

    private suspend fun refreshAccessToken(): Boolean {
        val refreshToken = env.tokenProvider.getRefreshToken()
        if (refreshToken.isNullOrBlank()) {
            env.tokenProvider.clearAuthTokens()
            return false
        }
        return try {
            val tokens = executeRequest<TokenResponse>(
                url = "$baseUrl/auth/refresh",
                method = HttpMethod.Post,
                body = RefreshTokenRequest(refreshToken),
                headers = emptyMap(),
                parameters = emptyMap(),
            )
            env.tokenProvider.setAccessToken(tokens.access_token)
            env.tokenProvider.setRefreshToken(tokens.refresh_token)
            true
        } catch (e: Exception) {
            env.tokenProvider.clearAuthTokens()
            false
        }
    }

    private fun Map<String, String>?.withFreshAuthorization(): Map<String, String>? {
        if (this == null) return null
        val filtered = filterKeys { !it.equals(HttpHeaders.Authorization, ignoreCase = true) }
        val accessToken = env.tokenProvider.getAccessToken()
        return if (accessToken.isNullOrBlank()) {
            filtered
        } else {
            filtered + (HttpHeaders.Authorization to "Bearer $accessToken")
        }
    }
}
