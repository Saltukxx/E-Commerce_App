package com.himanshu_kumar.shoppingapp.ui.feature.cart

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshContainer
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.himanshu_kumar.domain.model.CartItemModel
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.CartScreen
import com.himanshu_kumar.shoppingapp.navigation.CartSummaryScreen
import com.himanshu_kumar.shoppingapp.utils.CurrencyUtils
import kotlinx.coroutines.delay
import org.koin.androidx.compose.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    navController: NavController,
    viewModel: CartViewModel = koinViewModel()
){

    val uiState = viewModel.uiState.collectAsState()
    val cartItems = remember { mutableStateOf(emptyList<CartItemModel>()) }

    val loading = remember { mutableStateOf(false) }
    val errorMsg = remember{ mutableStateOf<String?>(null) }
    val context = LocalContext.current
    LaunchedEffect(uiState.value){
        when(uiState.value){
            is CartEvent.Loading->{
                loading.value = true
                errorMsg.value = null
            }
            is CartEvent.Error->{
                loading.value = false
                cartItems.value = emptyList()
                errorMsg.value = (uiState.value as CartEvent.Error).message
            }
            is CartEvent.Success->{
                loading.value = false
                val data = (uiState.value as CartEvent.Success).data
                cartItems.value = data
                if(data.isEmpty()){
                    errorMsg.value = context.getString(R.string.cart_empty)
                }else{
                    errorMsg.value = null
                }
            }
        }
    }

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        val pullToRefreshState = rememberPullToRefreshState()
        if(pullToRefreshState.isRefreshing){
            LaunchedEffect(true) {
                viewModel.getCart()
                delay(500)
                pullToRefreshState.endRefresh()
            }
        }
        Box(modifier = Modifier.fillMaxSize()){
            PullToRefreshContainer(
                state = pullToRefreshState,
                modifier = Modifier.align(Alignment.TopCenter)
            )
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .nestedScroll(pullToRefreshState.nestedScrollConnection)
                    .padding(16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 32.dp, vertical = 16.dp)
                ){
                    Image(
                        painter = painterResource(R.drawable.ic_back),
                        contentDescription = stringResource(R.string.back),
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .clickable { navController.popBackStack() }
                    )
                    Text(
                        text = stringResource(R.string.my_cart),
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                Spacer(modifier = Modifier.size(8.dp))
                val shouldShowList = !loading.value && errorMsg.value == null
                AnimatedVisibility(
                    visible = shouldShowList,
                    enter = fadeIn()
                ) {
                    LazyColumn {
                        items(cartItems.value){item->
                            CartItem(
                                item,
                                onIncrement = { viewModel.incrementQuantity(it) },
                                onDecrement = { viewModel.decrementQuantity(it) },
                                onRemove = { viewModel.removeItem(it) }
                            )
                        }
                    }
                }
                Spacer(Modifier.weight(0.5f))

                   Row(
                       modifier = Modifier
                           .fillMaxWidth()
                           .padding(16.dp)
                   ){
                       Text(
                           text = stringResource(R.string.total),
                           style = MaterialTheme.typography.titleSmall,
                           color = Color.LightGray
                       )
                       Spacer(Modifier.weight(1f))
                       Text(
                           text = CurrencyUtils.formatPrice(cartItems.value.sumOf { it.price * it.quantity }),
                           style = MaterialTheme.typography.titleSmall,
                           color = Color.Black
                       )
                   }
                Spacer(Modifier.size(15.dp))
                if(shouldShowList)
                {
                    Button(
                        onClick = {
                            navController.navigate(CartSummaryScreen)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp)
                            .align(Alignment.CenterHorizontally),
                        colors = ButtonDefaults.buttonColors(containerColor = colorResource(R.color.button_color))
                    ) {
                        Text(
                            text = stringResource(R.string.proceed_checkout),
                            style = MaterialTheme.typography.titleMedium,
                        )
                    }
                }
            }
            if(loading.value){
                Column(
                    modifier = Modifier.align(Alignment.Center)
                ) {
                    CircularProgressIndicator(modifier = Modifier.size(48.dp))
                    Text(text = stringResource(R.string.loading))
                }
            }
            if(errorMsg.value != null){
                Text(
                    text = errorMsg.value ?: stringResource(R.string.error_generic),
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    }
}

@Composable
fun CartItem(
    item:CartItemModel,
    onIncrement:(CartItemModel) ->Unit,
    onDecrement:(CartItemModel) ->Unit,
    onRemove:(CartItemModel) ->Unit
){
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.LightGray.copy(alpha = 0.4f))
    ) {
        AsyncImage(
            model = item.imageUrl,
            contentDescription = null,
            modifier = Modifier.size(126.dp, 100.dp).padding(8.dp),
            contentScale = ContentScale.Crop
        )
        Spacer(modifier = Modifier.size(8.dp))
        Column(
            modifier = Modifier
                .weight(1f),
            verticalArrangement = Arrangement.Center
        ) {
            Spacer(modifier = Modifier.size(8.dp))
            Text(
                text = item.productName,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
            )
            Spacer(modifier = Modifier.size(4.dp))
            Text(
                text = CurrencyUtils.formatPrice(item.price),
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.size(2.dp))
            Text(
                text = stringResource(R.string.cart_item_variant_default),
                fontSize = 10.sp,
                color = Color.Black
            )
        }
        Column(verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.End) {
            IconButton(
                onClick = {
                    onRemove(item)
                }
            ) {
                Image(painter = painterResource(id = R.drawable.ic_delete), contentDescription = null)
            }
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = {
                        onIncrement(item)
                    }
                ) {
                    Image(painter = painterResource(id = R.drawable.ic_add), contentDescription = null)
                }
                Text(text = "${item.quantity}")
                IconButton(
                    onClick = {
                        onDecrement(item)
                    }
                ) {
                    Image(painter = painterResource(id = R.drawable.ic_subtract), contentDescription = null)
                }
            }
        }
    }
}
