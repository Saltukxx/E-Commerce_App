package com.himanshu_kumar.shoppingapp.ui.feature.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.GetProfileUseCase
import com.himanshu_kumar.domain.usecase.LogoutUseCase
import com.himanshu_kumar.shoppingapp.AppSession
import com.himanshu_kumar.shoppingapp.model.UserAddress
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ProfileViewModel(
    private val appSession: AppSession,
    private val getProfileUseCase: GetProfileUseCase,
    private val logoutUseCase: LogoutUseCase,
) :ViewModel(){

    private val _uiState = MutableStateFlow<ProfileScreenEvent>(ProfileScreenEvent.Loading)
    val uiState: StateFlow<ProfileScreenEvent> = _uiState.asStateFlow()

    private val _messages = MutableSharedFlow<String>()
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    init {
        getUserDetail()
    }

    private fun getUserDetail() {
        val cachedUserId = appSession.getUser()
        if (cachedUserId == 0) {
            _uiState.value = ProfileScreenEvent.LoggedOut
            return
        }
        _uiState.value = ProfileScreenEvent.Success(
            userDetails = appSession.getUserDetails(),
            address = appSession.getAddress(),
            isLoggingOut = false,
        )
        refreshUserDetail()
    }

    fun refreshUserDetail() {
        viewModelScope.launch {
            when (val result = getProfileUseCase.execute()) {
                is ResultWrapper.Success -> {
                    appSession.storeUser(result.value)
                    _uiState.value = ProfileScreenEvent.Success(
                        userDetails = result.value,
                        address = appSession.getAddress(),
                        isLoggingOut = false,
                    )
                }
                is ResultWrapper.Failure -> {
                    appSession.clearUserSession()
                    _uiState.value = ProfileScreenEvent.LoggedOut
                }
            }
        }
    }

    fun saveAddress(address: UserAddress) {
        appSession.storeAddress(address)
        val currentUser = (_uiState.value as? ProfileScreenEvent.Success)?.userDetails
            ?: appSession.getUserDetails()
        _uiState.value = ProfileScreenEvent.Success(
            userDetails = currentUser,
            address = address,
            isLoggingOut = false,
        )
    }

    fun showComingSoon(message: String) {
        viewModelScope.launch {
            _messages.emit(message)
        }
    }

    fun logout() {
        val currentState = _uiState.value as? ProfileScreenEvent.Success
        if (currentState?.isLoggingOut == true) return
        if (currentState != null) {
            _uiState.value = currentState.copy(isLoggingOut = true)
        }
        viewModelScope.launch {
            appSession.getRefreshToken()?.let { refreshToken ->
                logoutUseCase.execute(refreshToken)
            }
            appSession.clearUserSession()
            _uiState.value = ProfileScreenEvent.LoggedOut
        }
    }
}

sealed class ProfileScreenEvent{
    data object Loading:ProfileScreenEvent()
    data class Success(
        val userDetails:UserDomainModel,
        val address: UserAddress?,
        val isLoggingOut: Boolean,
    ):ProfileScreenEvent()
    data class Error(val message:String):ProfileScreenEvent()
    data object LoggedOut:ProfileScreenEvent()
}
