package com.himanshu_kumar.domain.di

import com.himanshu_kumar.domain.usecase.AddToCartUseCase
import com.himanshu_kumar.domain.usecase.AddToWishlistUseCase
import com.himanshu_kumar.domain.usecase.CartSummaryUseCase
import com.himanshu_kumar.domain.usecase.DeleteProductUseCase
import com.himanshu_kumar.domain.usecase.GetCartUseCase
import com.himanshu_kumar.domain.usecase.GetCategoriesUserCase
import com.himanshu_kumar.domain.usecase.GetProfileUseCase
import com.himanshu_kumar.domain.usecase.GetWishlistUseCase
import com.himanshu_kumar.domain.usecase.GetProductUseCase
import com.himanshu_kumar.domain.usecase.LoginUseCase
import com.himanshu_kumar.domain.usecase.LogoutUseCase
import com.himanshu_kumar.domain.usecase.OrderListUseCase
import com.himanshu_kumar.domain.usecase.PlaceOrderUseCase
import com.himanshu_kumar.domain.usecase.RegisterUseCase
import com.himanshu_kumar.domain.usecase.RemoveFromWishlistUseCase
import com.himanshu_kumar.domain.usecase.UpdateQuantityUseCase
import org.koin.dsl.module

val useCaseModule = module {                   // a container where we define what classes can be injected
    factory { GetProductUseCase(get()) }           //for new instances on each injection.
    factory { GetCategoriesUserCase(get()) }        // get() means inject the required dependency
    factory { AddToCartUseCase(get())  }
    factory { GetCartUseCase(get()) }
    factory { UpdateQuantityUseCase(get()) }
    factory { DeleteProductUseCase(get()) }
    factory { CartSummaryUseCase(get()) }
    factory { PlaceOrderUseCase(get()) }
    factory { OrderListUseCase(get()) }
    factory { LoginUseCase(get()) }
    factory { RegisterUseCase(get()) }
    factory { GetProfileUseCase(get()) }
    factory { LogoutUseCase(get()) }
    factory { GetWishlistUseCase(get()) }
    factory { AddToWishlistUseCase(get()) }
    factory { RemoveFromWishlistUseCase(get()) }
}
