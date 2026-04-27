package com.himanshu_kumar.shoppingapp.ui.feature.authentication.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.LoginUseCase
import com.himanshu_kumar.domain.usecase.RegisterUseCase
import com.himanshu_kumar.shoppingapp.AppSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class RegisterViewModel(
    private val registerUseCase: RegisterUseCase,
    private val loginUseCase: LoginUseCase,
    private val appSession: AppSession,
):ViewModel() {


    private val _registerState = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val registerState: StateFlow<RegisterState> = _registerState.asStateFlow()


    fun register(email:String,password:String, name:String){
        _registerState.value = RegisterState.Loading
        viewModelScope.launch {
            when(val result = registerUseCase.execute(
                email, password, name
            )){
                is ResultWrapper.Success -> {
                    loginAfterRegister(email, password)
                }
                is ResultWrapper.Failure -> {
                    _registerState.value = RegisterState.Error(result.message)
                }
            }
        }
    }

    private suspend fun loginAfterRegister(email: String, password: String) {
        when (val result = loginUseCase.execute(email, password)) {
            is ResultWrapper.Success -> {
                val loginResult = result.value
                appSession.setAccessToken(loginResult.accessToken)
                appSession.setRefreshToken(loginResult.refreshToken)
                appSession.storeUser(loginResult.user)
                _registerState.value = RegisterState.Success()
            }
            is ResultWrapper.Failure -> {
                _registerState.value = RegisterState.Error(result.message)
            }
        }
    }
}

sealed class RegisterState{
    data object Idle:RegisterState()
    data object Loading:RegisterState()
    class Success():RegisterState()
    data class Error(val message:String):RegisterState()
}
