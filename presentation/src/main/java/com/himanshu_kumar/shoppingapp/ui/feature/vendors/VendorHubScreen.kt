package com.himanshu_kumar.shoppingapp.ui.feature.vendors

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.StoreApplicationScreen
import com.himanshu_kumar.shoppingapp.navigation.VendorListScreen

@Composable
fun VendorHubScreen(navController: NavController) {
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
                text = stringResource(R.string.vendor_hub_title),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(start = 12.dp),
            )
        }

        Text(
            text = stringResource(R.string.vendor_hub_subtitle),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
            modifier = Modifier.padding(vertical = 12.dp),
        )

        VendorHubCard(
            title = stringResource(R.string.vendor_hub_apply_title),
            body = stringResource(R.string.vendor_hub_apply_body),
            onClick = { navController.navigate(StoreApplicationScreen) },
        )
        Spacer(Modifier.size(12.dp))
        VendorHubCard(
            title = stringResource(R.string.vendor_hub_browse_title),
            body = stringResource(R.string.vendor_hub_browse_body),
            onClick = { navController.navigate(VendorListScreen) },
        )
    }
}

@Composable
private fun VendorHubCard(
    title: String,
    body: String,
    onClick: () -> Unit,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleSmall)
            Text(
                text = body,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                modifier = Modifier.padding(top = 6.dp),
            )
        }
    }
}
