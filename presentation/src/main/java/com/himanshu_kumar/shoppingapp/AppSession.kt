package com.himanshu_kumar.shoppingapp

import android.content.Context
import com.himanshu_kumar.data.network.AuthTokenProvider
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.shoppingapp.model.UserAddress

interface UserSession {
    fun getUser(): Int
    fun getSavedAddress(): UserAddress? = null
    fun storeSavedAddress(address: UserAddress) = Unit
}

class AppSession(private val context: Context) : AuthTokenProvider, UserSession {

    private fun prefs() = context.getSharedPreferences("user", Context.MODE_PRIVATE)

    override fun getAccessToken(): String? = prefs().getString("access_token", null)

    override fun setAccessToken(token: String?) {
        prefs().edit().apply {
            if (token == null) remove("access_token")
            else putString("access_token", token)
            apply()
        }
    }

    override fun getRefreshToken(): String? = prefs().getString("refresh_token", null)

    override fun setRefreshToken(token: String?) {
        prefs().edit().apply {
            if (token == null) remove("refresh_token")
            else putString("refresh_token", token)
            apply()
        }
    }

    override fun clearAuthTokens() {
        prefs().edit()
            .remove("access_token")
            .remove("refresh_token")
            .apply()
    }

    fun storeUser(user: UserDomainModel) {
        with(prefs().edit()) {
            putInt("id", user.id)
            putString("userName", user.name)
            putString("email", user.email)
            putString("avatar", user.avatar)
            apply()
        }
    }

    override fun getUser(): Int = prefs().getInt("id", 0)

    fun getUserDetails(): UserDomainModel {
        val sharedPref = prefs()
        return UserDomainModel(
            id = sharedPref.getInt("id", 0),
            name = sharedPref.getString("userName", "") ?: "",
            password = "",
            avatar = sharedPref.getString("avatar", "") ?: "",
            role = "",
            email = sharedPref.getString("email", "") ?: "",
        )
    }

    fun storeAddress(address: UserAddress) {
        with(prefs().edit()) {
            putString("addressLine", address.addressLine)
            putString("city", address.city)
            putString("state", address.state)
            putString("postalCode", address.postalCode)
            putString("country", address.country)
            apply()
        }
    }

    fun getAddress(): UserAddress? {
        val sharedPref = prefs()
        val addressLine = sharedPref.getString("addressLine", null)
        val city = sharedPref.getString("city", null)
        val state = sharedPref.getString("state", null)
        val postalCode = sharedPref.getString("postalCode", null)
        val country = sharedPref.getString("country", null)
        if (
            addressLine.isNullOrBlank() ||
            city.isNullOrBlank() ||
            state.isNullOrBlank() ||
            postalCode.isNullOrBlank() ||
            country.isNullOrBlank()
        ) {
            return null
        }
        return UserAddress(
            addressLine = addressLine,
            city = city,
            state = state,
            postalCode = postalCode,
            country = country,
        )
    }

    override fun getSavedAddress(): UserAddress? = getAddress()

    override fun storeSavedAddress(address: UserAddress) {
        storeAddress(address)
    }

    fun clearAddress() {
        prefs().edit()
            .remove("addressLine")
            .remove("city")
            .remove("state")
            .remove("postalCode")
            .remove("country")
            .apply()
    }

    fun clearUserSession() {
        prefs().edit().clear().apply()
    }
}
