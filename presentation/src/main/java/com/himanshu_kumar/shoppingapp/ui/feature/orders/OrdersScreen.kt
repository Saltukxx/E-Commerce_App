package com.himanshu_kumar.shoppingapp.ui.feature.orders

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.himanshu_kumar.domain.model.OrdersData
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.navigation.OrderDetailRoute
import com.himanshu_kumar.shoppingapp.navigation.toNavOrderDetail
import com.himanshu_kumar.shoppingapp.utils.CurrencyUtils
import org.koin.androidx.compose.koinViewModel

@Composable
fun OrdersScreen(
    navController: NavController,
    viewModel: OrdersViewModel = koinViewModel()
){
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(vertical = 16.dp, horizontal = 4.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ){
            Image(
                painter = painterResource(R.drawable.ic_back),
                contentDescription = stringResource(R.string.back),
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .clickable { navController.popBackStack() }
            )
            Text(
                text = stringResource(R.string.my_orders),
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(Alignment.Center)
            )
        }


        val uiState = viewModel.orderState.collectAsState()


        // tab row
        val tabs = listOf(
            stringResource(R.string.tab_all),
            stringResource(R.string.tab_pending),
            stringResource(R.string.tab_completed),
            stringResource(R.string.tab_cancelled)
        )
        val selectedTab = remember { mutableIntStateOf(0) }
        TabRow(
            selectedTabIndex = selectedTab.intValue
        ) {
            tabs.forEachIndexed { index, title ->
                Box(modifier = Modifier.clickable {
                    selectedTab.intValue = index
                }){
                    Text(
                        text = title,
                        modifier = Modifier
                            .padding(horizontal = 5.dp, vertical = 12.dp)
                            .align(Alignment.Center),
                        style = MaterialTheme.typography.titleSmall
                    )
                }
            }
        }
        when(uiState.value){
            is OrderEvent.Loading ->{
                Column(
                    modifier = Modifier
                        .fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator()
                    Text(text = stringResource(R.string.loading))
                }
            }
            is OrderEvent.Success ->{
                val orders = (uiState.value as OrderEvent.Success).data
                when(selectedTab.intValue){
                    0 -> {
                        OrderList(orders = orders, navController = navController)
                    }
                    1 -> {
                        OrderList(orders = viewModel.filterOrders(orders, "Pending"), navController = navController)
                    }
                    2 -> {
                        OrderList(orders = viewModel.filterOrders(orders, "Delivered"), navController = navController)
                    }
                    3 ->{
                        OrderList(orders = viewModel.filterOrders(orders, "Cancelled"), navController = navController)
                    }
                }
            }
            is OrderEvent.Error ->{
                Column(
                    modifier = Modifier
                        .fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(text = (uiState.value as OrderEvent.Error).errorMsg)
                }
            }
        }
    }
}

@Composable
fun OrderList(orders: List<OrdersData>, navController: NavController) {
   if(orders.isEmpty()){
       Column(
           modifier = Modifier
               .fillMaxSize(),
           horizontalAlignment = Alignment.CenterHorizontally,
           verticalArrangement = Arrangement.Center
       ) {
           Text(text = stringResource(R.string.no_orders))
       }
   }else{
       LazyColumn {
           items(orders, key = {order -> order.id}){
               OrderItem(order = it, navController = navController)
           }
       }
   }
}
@Composable
fun OrderItem(order: OrdersData, navController: NavController)
{
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(Color.LightGray.copy(alpha = 0.1f))
            .padding(8.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
        ) {
            Text(
                text = stringResource(R.string.order_id, order.id),
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                modifier = Modifier
                    .align(Alignment.CenterStart)
            )
            Text(
                text = order.orderDate,
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Text(
                text = stringResource(
                    R.string.quantity_label,
                    order.items.sumOf { it.quantity }
                ),
                fontSize = 16.sp,
                modifier = Modifier
                    .align(Alignment.CenterStart)
            )
            Text(
                text = stringResource(
                    R.string.order_total,
                    CurrencyUtils.formatPrice(order.totalAmount)
                ),
                fontSize = 16.sp,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Text(
                text = order.status,
                color = when (order.status) {
                    "Delivered" -> Color.Green
                    "Pending" -> colorResource(R.color.orange_color)
                    else -> Color.Red
                },
                modifier = Modifier
                    .align(Alignment.CenterStart)
            )
            Box(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .clip(RoundedCornerShape(8.dp))
                    .padding(5.dp)
                    .background(Color.LightGray.copy(alpha = 0.3f))
            ){
                Text(
                    text = stringResource(R.string.details),
                    fontSize = 16.sp,
                    modifier = Modifier
                        .align(Alignment.CenterEnd)
                        .clickable {
                            navController.navigate(OrderDetailRoute(order.toNavOrderDetail()))
                        }
                )
            }
        }
    }
}