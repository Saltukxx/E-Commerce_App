package com.himanshu_kumar.shoppingapp.ui.feature.profile

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
//noinspection UsingMaterialAndMaterial3Libraries
import androidx.compose.material.Divider
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import coil.compose.AsyncImage
import com.himanshu_kumar.domain.model.UserDomainModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.model.UserAddress
import com.himanshu_kumar.shoppingapp.navigation.LoginScreen
import com.himanshu_kumar.shoppingapp.navigation.SettingsScreen
import com.himanshu_kumar.shoppingapp.navigation.UserAddressRoute
import com.himanshu_kumar.shoppingapp.navigation.UserAddressWrapper
import com.himanshu_kumar.shoppingapp.navigation.WishlistScreen
import com.himanshu_kumar.shoppingapp.ui.feature.user_address.USER_ADDRESS_SCREEN
import org.koin.androidx.compose.koinViewModel

@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = koinViewModel()
) {
    val uiState = viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val backStackEntry = navController.currentBackStackEntryAsState().value

    LaunchedEffect(Unit) {
        viewModel.messages.collect { message ->
            snackbarHostState.showSnackbar(message)
        }
    }

    LaunchedEffect(backStackEntry) {
        val savedStateHandle = backStackEntry?.savedStateHandle
        val address = savedStateHandle?.get<UserAddress>(USER_ADDRESS_SCREEN)
        if (address != null) {
            viewModel.saveAddress(address)
            savedStateHandle.remove<UserAddress>(USER_ADDRESS_SCREEN)
        }
    }

    if (uiState.value is ProfileScreenEvent.LoggedOut) {
        LaunchedEffect(Unit) {
            navController.navigate(LoginScreen) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        when (val state = uiState.value) {
            is ProfileScreenEvent.Success -> {
                ProfileContent(
                    user = state.userDetails,
                    address = state.address,
                    isLoggingOut = state.isLoggingOut,
                    onAddressClick = {
                        navController.navigate(UserAddressRoute(UserAddressWrapper(state.address)))
                    },
                    onWishlistClick = { navController.navigate(WishlistScreen) },
                    onSettingsClick = { navController.navigate(SettingsScreen) },
                    onLogoutClick = viewModel::logout,
                )
            }
            is ProfileScreenEvent.Error -> {
                Text(
                    text = state.message,
                    modifier = Modifier.align(Alignment.Center),
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
            is ProfileScreenEvent.Loading -> {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            }
            is ProfileScreenEvent.LoggedOut -> Unit
        }
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter),
        )
    }
}

@Composable
private fun ProfileContent(
    user: UserDomainModel,
    address: UserAddress?,
    isLoggingOut: Boolean,
    onAddressClick: () -> Unit,
    onWishlistClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onLogoutClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(18.dp),
    ) {
        Spacer(Modifier.size(90.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            AsyncImage(
                model = user.avatar,
                contentDescription = stringResource(R.string.content_profile_picture),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(75.dp)
                    .clip(CircleShape)
            )

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = user.name,
                    style = MaterialTheme.typography.titleLarge
                )
                Spacer(modifier = Modifier.height(5.dp))
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.titleSmall
                )
            }

            Icon(
                painter = painterResource(id = R.drawable.ic_setting),
                contentDescription = stringResource(R.string.content_settings),
                modifier = Modifier
                    .size(30.dp)
                    .clickable { onSettingsClick() }
            )
        }

        Spacer(modifier = Modifier.height(50.dp))

        val detailsList = listOf(
            DetailsListItem(
                icon = painterResource(id = R.drawable.ic_address),
                title = stringResource(R.string.profile_address),
                subtitle = address?.toString() ?: stringResource(R.string.profile_address_empty),
                onClick = onAddressClick,
            ),
            DetailsListItem(
                icon = painterResource(id = R.drawable.ic_wishlist),
                title = stringResource(R.string.profile_wishlist),
                subtitle = null,
                onClick = onWishlistClick,
            ),
            DetailsListItem(
                icon = painterResource(id = R.drawable.ic_logout),
                title = if (isLoggingOut) stringResource(R.string.profile_logging_out) else stringResource(R.string.profile_logout),
                subtitle = null,
                enabled = !isLoggingOut,
                onClick = onLogoutClick,
            )
        )

        detailsList.forEach {
            ProfileListItem(
                icon = it.icon,
                title = it.title,
                subtitle = it.subtitle,
                enabled = it.enabled,
                onClick = it.onClick,
            )
        }
    }
}

@Composable
fun ProfileListItem(
    icon: Painter,
    title: String,
    subtitle: String? = null,
    enabled: Boolean = true,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                painter = icon,
                contentDescription = null,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(18.dp))
            Column {
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodyLarge
                )
                if (!subtitle.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.62f),
                    )
                }
            }
        }

        Icon(
            painter = painterResource(id = R.drawable.ic_right_arrow),
            contentDescription = stringResource(R.string.content_arrow),
            modifier = Modifier.size(20.dp)
        )
    }
    Divider(
        modifier = Modifier.padding(horizontal = 8.dp),
        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f),
        thickness = 1.dp
    )
    Spacer(modifier = Modifier.height(25.dp))
}

data class DetailsListItem(
    val icon: Painter,
    val title: String,
    val subtitle: String?,
    val enabled: Boolean = true,
    val onClick: () -> Unit,
)

//@Preview(showBackground = true)
//@Composable
//fun ProfileScreenPreview() {
//    ProfileScreen()
//}
