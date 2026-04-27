package com.himanshu_kumar.shoppingapp.ui.feature.user_address

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UserAddress


const val USER_ADDRESS_SCREEN = "user_address"
@Composable
fun UserAddressScreen(
    navController: NavController,
    userAddress: UserAddress?
){
    val addressLine = remember { mutableStateOf(userAddress?.addressLine?:"") }
    val city = remember { mutableStateOf(userAddress?.city?:"") }
    val state = remember { mutableStateOf(userAddress?.state?:"") }
    val postalCode = remember { mutableStateOf(userAddress?.postalCode?:"") }
    val country = remember { mutableStateOf(userAddress?.country?:"") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 50.dp),

    ) {
        Box(
            modifier = Modifier.fillMaxWidth()
        ){
            Text(
                text = stringResource(R.string.add_address),
                style = androidx.compose.material3.MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Medium),
                modifier = Modifier.align(Alignment.Center)
            )
        }
        Spacer(Modifier.size(15.dp))
        OutlinedTextField(
            value = addressLine.value,
            onValueChange = { addressLine.value = it },
            label = { Text(stringResource(R.string.address_line)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.size(15.dp))
        OutlinedTextField(
            value = city.value,
            onValueChange = { city.value = it },
            label = { Text(stringResource(R.string.city)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.size(15.dp))
        OutlinedTextField(
            value = state.value,
            onValueChange = { state.value = it },
            label = { Text(stringResource(R.string.state)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.size(15.dp))
        OutlinedTextField(
            value = postalCode.value,
            onValueChange = { postalCode.value = it },
            label = { Text(stringResource(R.string.postal_code)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.size(15.dp))
        OutlinedTextField(
            value = country.value,
            onValueChange = { country.value = it },
            label = { Text(stringResource(R.string.country)) },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.size(15.dp))

        Spacer(Modifier.size(15.dp))
        Button(
            onClick = {
                val address = UserAddress(
                    addressLine = addressLine.value,
                    city = city.value,
                    state = state.value,
                    postalCode = postalCode.value,
                    country = country.value
                )
                val previousBackStackEntry = navController.previousBackStackEntry                   // get the previous back stack entry
                previousBackStackEntry?.savedStateHandle?.set(USER_ADDRESS_SCREEN, address)         //
                navController.popBackStack()
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = colorResource(R.color.button_color)),
            enabled = addressLine.value.isNotBlank() && city.value.isNotBlank() && state.value.isNotBlank() && postalCode.value.isNotBlank() && country.value.isNotBlank()
        ) {
            Text(
                text = stringResource(R.string.save_address)
            )
        }
    }
}