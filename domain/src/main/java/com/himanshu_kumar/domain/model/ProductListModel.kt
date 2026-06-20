package com.himanshu_kumar.domain.model



data class ProductListModel(

    val category: ProductCategory,

    val description: String,

    val id: Int,

    val images: List<String>,

    val price: Int,

    val slug: String,

    val title: String,

    val store: StoreSummaryModel? = null,

) {

    val storeId: Int get() = store?.id ?: 0

    val storeName: String get() = store?.name ?: ""

    val storeSlug: String get() = store?.slug ?: ""



    val priceString: String

        get() = "$price"

}

