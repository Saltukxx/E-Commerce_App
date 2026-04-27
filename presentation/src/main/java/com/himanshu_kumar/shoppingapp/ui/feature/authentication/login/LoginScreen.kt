package com.himanshu_kumar.shoppingapp.ui.feature.authentication.login

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.HomeScreen
import com.himanshu_kumar.shoppingapp.navigation.LoginScreen as LoginRoute
import com.himanshu_kumar.shoppingapp.navigation.RegisterScreen
import org.koin.androidx.compose.koinViewModel

@Composable
fun LoginScreen(
    navController: NavController,
    viewModel: LoginViewModel = koinViewModel()
){
    val loginState = viewModel.loginState.collectAsState()
    Column(
        modifier = Modifier
            .fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        when(val state = loginState.value){
            is LoginState.Success -> {
                LaunchedEffect(loginState.value) {
                    navController.navigate(HomeScreen) {
                        popUpTo(LoginRoute) { inclusive = true }
                    }
                }
            }
            is LoginState.Error -> {
                Text(text = state.message)
            }
            is LoginState.Loading -> {
                CircularProgressIndicator()
                Text(text = stringResource(R.string.loading))
            }
            else ->{
                LoginContent(
                    onSignInClick = { email, password ->
                        viewModel.login(email, password)
                    },
                    onRegisterClick = {
                        navController.navigate(RegisterScreen)
                    }
                )
            }
        }
    }
}

@Composable
fun LoginContent(
    onSignInClick:(String, String) -> Unit,
    onRegisterClick:()->Unit
){
    val email = remember{mutableStateOf("")}
    val password = remember{mutableStateOf("")}
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = stringResource(R.string.login),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold,
            fontSize = 25.sp
        )
        OutlinedTextField(
            value = email.value,
            onValueChange = {
                email.value = it
            },
            label = { Text(text = stringResource(R.string.email)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            singleLine = true
        )
        OutlinedTextField(
            value = password.value,
            onValueChange = {
                password.value = it
            },
            label = { Text(text = stringResource(R.string.password)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation()
        )
        Button(
            onClick = {
                onSignInClick(email.value, password.value)
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = email.value.isNotEmpty() && password.value.isNotEmpty(),
            colors = ButtonDefaults.buttonColors(containerColor = colorResource(R.color.button_color))
        ) {
            Text(text = stringResource(R.string.login))
        }
        Text(
            text = stringResource(R.string.does_not_have_account),
            modifier = Modifier.padding(vertical = 8.dp)
                .clickable {
                    onRegisterClick()
                },
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

@Composable
@Preview(showBackground = true)
fun PreviewLoginScreen(){
    LoginContent(
        onSignInClick = { a, b-> },
        onRegisterClick = {}
    )
}
