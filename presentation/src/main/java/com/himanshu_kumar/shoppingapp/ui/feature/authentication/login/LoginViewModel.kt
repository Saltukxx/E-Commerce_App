package com.himanshu_kumar.shoppingapp.ui.feature.authentication.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.himanshu_kumar.domain.network.ResultWrapper
import com.himanshu_kumar.domain.usecase.LoginUseCase
import com.himanshu_kumar.shoppingapp.AppSession
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class LoginViewModel(
    private val loginUseCase: LoginUseCase,
    private val appSession: AppSession
):ViewModel() {


    private val _loginState = MutableStateFlow<LoginState>(LoginState.Idle)
    val loginState: StateFlow<LoginState> = _loginState.asStateFlow()


    fun login(email:String,password:String){
        appSession.clearAuthTokens()
        _loginState.value = LoginState.Loading
        viewModelScope.launch {
            when(val result = loginUseCase.execute(email, password)){
                is ResultWrapper.Success -> {
                    val lr = result.value
                    appSession.setAccessToken(lr.accessToken)
                    appSession.setRefreshToken(lr.refreshToken)
                    appSession.storeUser(lr.user)
                    _loginState.value = LoginState.Success()
                }
                is ResultWrapper.Failure -> {
                    _loginState.value = LoginState.Error(result.message)
                }
            }
        }
    }
}

sealed class LoginState{
    data object Idle:LoginState()
    data object Loading:LoginState()
    class Success():LoginState()
    data class Error(val message:String):LoginState()
}
