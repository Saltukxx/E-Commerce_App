package com.himanshu_kumar.shoppingapp.ui.feature.vendors

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import com.himanshu_kumar.domain.model.StoreApplicationRequest
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.ui.feature.category_list.CategoryTopBar
import org.koin.androidx.compose.koinViewModel
import android.util.Patterns

@Composable
fun StoreApplicationScreen(
    navController: NavController,
    viewModel: StoreApplicationViewModel = koinViewModel(),
) {
    val uiState = viewModel.uiState.collectAsStateWithLifecycle().value
    val businessName = remember { mutableStateOf("") }
    val contactName = remember { mutableStateOf("") }
    val contactEmail = remember { mutableStateOf("") }
    val phone = remember { mutableStateOf("") }
    val message = remember { mutableStateOf("") }

    val validationError = remember { mutableStateOf<String?>(null) }
    val errBusiness = stringResource(R.string.business_name_required)
    val errName = stringResource(R.string.name_required)
    val errEmail = stringResource(R.string.invalid_email)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        CategoryTopBar(
            title = stringResource(R.string.become_seller_title),
            onBackClick = { navController.popBackStack() },
            onSearchClick = { },
            showSearchAction = false,
        )
        Spacer(Modifier.size(8.dp))
        Text(
            text = stringResource(R.string.become_seller_body),
            style = MaterialTheme.typography.bodyMedium,
        )
        Spacer(Modifier.size(16.dp))
        OutlinedTextField(
            value = businessName.value,
            onValueChange = { businessName.value = it },
            label = { Text(stringResource(R.string.business_name)) },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.size(8.dp))
        OutlinedTextField(
            value = contactName.value,
            onValueChange = { contactName.value = it },
            label = { Text(stringResource(R.string.name)) },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.size(8.dp))
        OutlinedTextField(
            value = contactEmail.value,
            onValueChange = { contactEmail.value = it },
            label = { Text(stringResource(R.string.email)) },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.size(8.dp))
        OutlinedTextField(
            value = phone.value,
            onValueChange = { phone.value = it },
            label = { Text(stringResource(R.string.phone)) },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.size(8.dp))
        OutlinedTextField(
            value = message.value,
            onValueChange = { message.value = it },
            label = { Text(stringResource(R.string.message)) },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
        )
        Spacer(Modifier.size(16.dp))
        validationError.value?.let { msg ->
            Text(text = msg, color = MaterialTheme.colorScheme.error)
            Spacer(Modifier.size(8.dp))
        }
        when (val state = uiState) {
            is StoreApplicationUiState.Success -> {
                Text(text = state.message, color = MaterialTheme.colorScheme.primary)
            }
            is StoreApplicationUiState.Error -> {
                val friendly = if (state.message.contains("pending", ignoreCase = true)) {
                    stringResource(R.string.application_pending_error)
                } else {
                    state.message
                }
                Text(text = friendly, color = MaterialTheme.colorScheme.error)
            }
            else -> Unit
        }
        Button(
            onClick = {
                validationError.value = null
                val business = businessName.value.trim()
                val contact = contactName.value.trim()
                val email = contactEmail.value.trim()
                when {
                    business.length < 2 -> validationError.value = errBusiness
                    contact.length < 2 -> validationError.value = errName
                    !Patterns.EMAIL_ADDRESS.matcher(email).matches() -> validationError.value = errEmail
                    else -> viewModel.submit(
                        StoreApplicationRequest(
                            businessName = business,
                            contactName = contact,
                            contactEmail = email,
                            phone = phone.value.trim(),
                            message = message.value.trim(),
                        ),
                    )
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = uiState !is StoreApplicationUiState.Loading,
        ) {
            Text(
                text = if (uiState is StoreApplicationUiState.Loading) {
                    stringResource(R.string.loading)
                } else {
                    stringResource(R.string.submit_application)
                },
            )
        }
    }
}
