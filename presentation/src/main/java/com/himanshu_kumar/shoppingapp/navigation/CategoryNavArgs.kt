package com.himanshu_kumar.shoppingapp.navigation

object CategoryNavArgs {
    const val CATEGORY_ID = "categoryId"
    const val CATEGORY_LIST_TITLE = "categoryListTitle"
    const val STORE_SLUG = "storeSlug"
}

object CatalogSearchNavArgs {
    const val INITIAL_QUERY = "catalogSearchInitialQuery"
}

/** Pass to [CategoryItemsListScreen] / saved state to load all products (API without category filter). */
const val ALL_PRODUCTS_CATEGORY_ID = -1
