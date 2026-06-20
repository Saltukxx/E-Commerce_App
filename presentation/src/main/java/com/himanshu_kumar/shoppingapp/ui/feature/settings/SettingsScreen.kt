package com.himanshu_kumar.shoppingapp.ui.feature.settings

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.himanshu_kumar.shoppingapp.AppSession
import com.himanshu_kumar.shoppingapp.BuildConfig
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.StoreApplicationScreen

@Composable
fun SettingsScreen(navController: NavController, appSession: AppSession) {
    val notificationsEnabled = remember {
        mutableStateOf(appSession.areNotificationsEnabled())
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Image(
                painter = painterResource(R.drawable.ic_back),
                contentDescription = stringResource(R.string.back),
                modifier = Modifier
                    .size(28.dp)
                    .clickable { navController.popBackStack() },
            )
            Text(
                text = stringResource(R.string.settings_title),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(start = 12.dp),
            )
        }
        Spacer(Modifier.size(24.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = stringResource(R.string.settings_notifications_title),
                    style = MaterialTheme.typography.titleSmall,
                )
                Spacer(Modifier.size(6.dp))
                Text(
                    text = if (notificationsEnabled.value) {
                        stringResource(R.string.settings_notifications_enabled)
                    } else {
                        stringResource(R.string.settings_notifications_disabled)
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f),
                )
            }
            Switch(
                checked = notificationsEnabled.value,
                onCheckedChange = {
                    notificationsEnabled.value = it
                    appSession.setNotificationsEnabled(it)
                },
            )
        }
        Spacer(Modifier.size(20.dp))
        Text(
            text = stringResource(R.string.become_seller),
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.clickable {
                navController.navigate(StoreApplicationScreen)
            },
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(Modifier.size(20.dp))
        Text(
            text = stringResource(R.string.settings_about_title),
            style = MaterialTheme.typography.titleSmall,
        )
        Spacer(Modifier.size(6.dp))
        Text(
            text = stringResource(R.string.settings_about_body),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f),
        )
        Spacer(Modifier.size(20.dp))
        Text(
            text = stringResource(R.string.settings_api_label),
            style = MaterialTheme.typography.titleSmall,
        )
        Spacer(Modifier.size(6.dp))
        Text(
            text = BuildConfig.API_BASE_URL,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}
