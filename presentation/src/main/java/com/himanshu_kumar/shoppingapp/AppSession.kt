package com.himanshu_kumar.shoppingapp

import android.content.Context
import android.content.SharedPreferences
import com.himanshu_kumar.data.network.AuthTokenProvider
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.shoppingapp.model.UserAddress

interface UserSession {
    fun getUser(): Int
    fun getSavedAddress(): UserAddress? = null
    fun storeSavedAddress(address: UserAddress) = Unit
}

class AppSession(private val context: Context) : AuthTokenProvider, UserSession {

    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    override fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)

    override fun setAccessToken(token: String?) {
        prefs.edit().apply {
            if (token == null) remove(KEY_ACCESS_TOKEN)
            else putString(KEY_ACCESS_TOKEN, token)
            apply()
        }
    }

    override fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)

    override fun setRefreshToken(token: String?) {
        prefs.edit().apply {
            if (token == null) remove(KEY_REFRESH_TOKEN)
            else putString(KEY_REFRESH_TOKEN, token)
            apply()
        }
    }

    override fun clearAuthTokens() {
        prefs.edit()
            .remove(KEY_ACCESS_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .apply()
    }

    fun storeUser(user: UserDomainModel) {
        with(prefs.edit()) {
            putInt(KEY_USER_ID, user.id)
            putString(KEY_USER_NAME, user.name)
            putString(KEY_EMAIL, user.email)
            putString(KEY_AVATAR, user.avatar)
            apply()
        }
    }

    override fun getUser(): Int = prefs.getInt(KEY_USER_ID, 0)

    fun getUserDetails(): UserDomainModel {
        return UserDomainModel(
            id = prefs.getInt(KEY_USER_ID, 0),
            name = prefs.getString(KEY_USER_NAME, "") ?: "",
            password = "",
            avatar = prefs.getString(KEY_AVATAR, "") ?: "",
            role = "",
            email = prefs.getString(KEY_EMAIL, "") ?: "",
        )
    }

    fun storeAddress(address: UserAddress) {
        with(prefs.edit()) {
            putString(KEY_ADDRESS_LINE, address.addressLine)
            putString(KEY_CITY, address.city)
            putString(KEY_STATE, address.state)
            putString(KEY_POSTAL_CODE, address.postalCode)
            putString(KEY_COUNTRY, address.country)
            apply()
        }
    }

    fun getAddress(): UserAddress? {
        val addressLine = prefs.getString(KEY_ADDRESS_LINE, null)
        val city = prefs.getString(KEY_CITY, null)
        val state = prefs.getString(KEY_STATE, null)
        val postalCode = prefs.getString(KEY_POSTAL_CODE, null)
        val country = prefs.getString(KEY_COUNTRY, null)
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
        prefs.edit()
            .remove(KEY_ADDRESS_LINE)
            .remove(KEY_CITY)
            .remove(KEY_STATE)
            .remove(KEY_POSTAL_CODE)
            .remove(KEY_COUNTRY)
            .apply()
    }

    fun areNotificationsEnabled(): Boolean = prefs.getBoolean(KEY_NOTIFICATIONS, true)

    fun setNotificationsEnabled(enabled: Boolean) {
        prefs.edit()
            .putBoolean(KEY_NOTIFICATIONS, enabled)
            .apply()
    }

    fun clearUserSession() {
        prefs.edit().clear().apply()
    }

    fun hasStoredCredentials(): Boolean =
        getUser() != 0 && !getRefreshToken().isNullOrBlank()

    companion object {
        private const val PREFS_NAME = "user_secure"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "id"
        private const val KEY_USER_NAME = "userName"
        private const val KEY_EMAIL = "email"
        private const val KEY_AVATAR = "avatar"
        private const val KEY_ADDRESS_LINE = "addressLine"
        private const val KEY_CITY = "city"
        private const val KEY_STATE = "state"
        private const val KEY_POSTAL_CODE = "postalCode"
        private const val KEY_COUNTRY = "country"
        private const val KEY_NOTIFICATIONS = "notificationsEnabled"
    }
}
