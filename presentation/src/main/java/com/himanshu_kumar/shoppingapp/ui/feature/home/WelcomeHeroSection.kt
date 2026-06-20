package com.himanshu_kumar.shoppingapp.ui.feature.home

import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.himanshu_kumar.shoppingapp.R
import com.himanshu_kumar.shoppingapp.ui.theme.DurmusBabaTheme

private val HeroCardShape = RoundedCornerShape(24.dp)
private val HeroBannerShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
private val FeatureCardShape = RoundedCornerShape(16.dp)
private val PillShape = RoundedCornerShape(100.dp)

private data class WelcomeFeature(
    @DrawableRes val iconRes: Int,
    @StringRes val titleRes: Int,
    @StringRes val bodyRes: Int,
)

@Composable
fun WelcomeHeroSection(
    onBrowseCatalog: () -> Unit,
    onOpenMarket: () -> Unit,
    onBecomeSeller: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val features = remember {
        listOf(
            WelcomeFeature(
                iconRes = R.drawable.ic_search,
                titleRes = R.string.home_welcome_feature_catalog_title,
                bodyRes = R.string.home_welcome_feature_catalog_body_short,
            ),
            WelcomeFeature(
                iconRes = R.drawable.ic_cart,
                titleRes = R.string.home_welcome_feature_pricing_title,
                bodyRes = R.string.home_welcome_feature_pricing_body_short,
            ),
        )
    }
    val heroBackground = colorResource(R.color.secondary_container)
    val primary = colorResource(R.color.stitch_primary)
    val outlineVariant = colorResource(R.color.outline_variant)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
    ) {
        Text(
            text = stringResource(R.string.home_welcome_section_title),
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Bold,
                fontSize = MaterialTheme.typography.headlineMedium.fontSize,
            ),
            color = primary,
        )
        Spacer(Modifier.height(16.dp))
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = HeroCardShape,
            color = heroBackground,
            border = BorderStroke(1.dp, outlineVariant.copy(alpha = 0.35f)),
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Image(
                    painter = painterResource(R.drawable.home_welcome_banner),
                    contentDescription = stringResource(R.string.home_welcome_banner_content_desc),
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(2.05f)
                        .clip(HeroBannerShape),
                    contentScale = ContentScale.Crop,
                    alignment = Alignment.CenterStart,
                )
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .padding(bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    features.forEach { feature ->
                        WelcomeFeatureCard(
                            feature = feature,
                            modifier = Modifier.weight(1f),
                            primary = primary,
                            iconBackground = heroBackground,
                        )
                    }
                }
                HowItWorksStrip(primary = primary, outlineVariant = outlineVariant)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Button(
                        onClick = onBrowseCatalog,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = PillShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = primary,
                            contentColor = Color.White,
                        ),
                    ) {
                        Text(
                            text = stringResource(R.string.home_welcome_cta_browse),
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                    TextButton(
                        onClick = onOpenMarket,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(
                            text = stringResource(R.string.home_welcome_cta_market),
                            style = MaterialTheme.typography.labelLarge,
                            color = primary,
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                    Text(
                        text = stringResource(R.string.home_welcome_cta_seller),
                        style = MaterialTheme.typography.bodyMedium,
                        color = primary.copy(alpha = 0.7f),
                        modifier = Modifier
                            .align(Alignment.CenterHorizontally)
                            .clickable(onClick = onBecomeSeller)
                            .padding(vertical = 4.dp),
                    )
                }
                }
            }
        }
    }
}

@Composable
private fun WelcomeFeatureCard(
    feature: WelcomeFeature,
    primary: Color,
    iconBackground: Color,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = FeatureCardShape,
        color = Color.White,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(iconBackground),
                contentAlignment = Alignment.Center,
            ) {
                Image(
                    painter = painterResource(feature.iconRes),
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    colorFilter = ColorFilter.tint(primary),
                )
            }
            Text(
                text = stringResource(feature.titleRes),
                style = MaterialTheme.typography.labelLarge,
                color = primary,
                fontWeight = FontWeight.SemiBold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = stringResource(feature.bodyRes),
                style = MaterialTheme.typography.labelSmall,
                color = colorResource(R.color.on_surface_variant),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun HowItWorksStrip(
    primary: Color,
    outlineVariant: Color,
) {
    val steps = listOf(
        R.string.home_welcome_step_search,
        R.string.home_welcome_step_cart,
        R.string.home_welcome_step_order,
    )
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        itemsIndexed(steps) { index, stepRes ->
            Box(
                modifier = Modifier
                    .clip(PillShape)
                    .background(Color.White)
                    .border(1.dp, outlineVariant, PillShape)
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = stringResource(stepRes),
                    style = MaterialTheme.typography.labelSmall,
                    color = primary.copy(alpha = if (index == 0) 1f else 0.6f),
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun WelcomeHeroSectionPreview() {
    DurmusBabaTheme {
        WelcomeHeroSection(
            onBrowseCatalog = {},
            onOpenMarket = {},
            onBecomeSeller = {},
        )
    }
}
