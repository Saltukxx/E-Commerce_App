package com.himanshu_kumar.shoppingapp.ui.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.annotation.DrawableRes
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.shoppingapp.R

private val SectionCardShape = RoundedCornerShape(16.dp)

@Composable
fun TopBrandsSection(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val primary = colorResource(R.color.stitch_primary)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(R.string.home_top_brands),
                style = MaterialTheme.typography.labelLarge,
                color = colorResource(R.color.on_surface_variant),
                fontWeight = FontWeight.SemiBold,
            )
            Image(
                painter = painterResource(R.drawable.ic_right_arrow),
                contentDescription = null,
                modifier = Modifier.size(20.dp),
                colorFilter = ColorFilter.tint(colorResource(R.color.outline)),
            )
        }
        Spacer(Modifier.height(12.dp))
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(128.dp)
                .clickable(onClick = onClick),
            shape = SectionCardShape,
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                Image(
                    painter = painterResource(R.drawable.embraco_home_promo),
                    contentDescription = stringResource(R.string.home_top_brands),
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(
                                    primary.copy(alpha = 0.82f),
                                    Color.Transparent,
                                ),
                            ),
                        ),
                )
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .padding(start = 16.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color.White.copy(alpha = 0.92f))
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                ) {
                    Text(
                        text = stringResource(R.string.home_embraco_brand),
                        style = MaterialTheme.typography.titleMedium,
                        color = primary,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

@Composable
fun PopularCategoriesGrid(
    categories: List<CategoriesListModel>,
    onCategoryClick: (Int) -> Unit,
    modifier: Modifier = Modifier,
    compressorCategory: CategoriesListModel? = null,
) {
    if (categories.isEmpty()) return
    val primary = colorResource(R.color.stitch_primary)
    val surfaceContainer = colorResource(R.color.surface_container)
    val compressorsLabel = stringResource(R.string.home_category_compressors)
    val displayCategories = remember(categories, compressorsLabel, compressorCategory) {
        resolvePopularHomeCategories(categories, compressorCategory)
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
    ) {
        Text(
            text = stringResource(R.string.home_popular_categories),
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
            color = primary,
        )
        Spacer(Modifier.height(16.dp))
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            displayCategories.chunked(2).forEach { rowCategories ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    rowCategories.forEach { category ->
                        val label = popularCategoryLabel(category, compressorsLabel)
                        val imageRes = popularCategoryImageRes(category)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .clip(SectionCardShape)
                                .background(surfaceContainer)
                                .clickable { onCategoryClick(category.id) },
                        ) {
                            if (imageRes != null) {
                                Image(
                                    painter = painterResource(imageRes),
                                    contentDescription = label,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop,
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(
                                            Brush.verticalGradient(
                                                colors = listOf(
                                                    Color.Transparent,
                                                    Color.Black.copy(alpha = 0.72f),
                                                ),
                                                startY = 80f,
                                            ),
                                        ),
                                )
                            }
                            Text(
                                text = label,
                                style = MaterialTheme.typography.labelLarge,
                                color = if (imageRes != null) Color.White else primary,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier
                                    .align(Alignment.BottomStart)
                                    .padding(12.dp),
                            )
                        }
                    }
                    if (rowCategories.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

internal fun resolvePopularHomeCategories(
    categories: List<CategoriesListModel>,
    compressorCategory: CategoriesListModel? = null,
): List<CategoriesListModel> {
    val compressor = compressorCategory ?: findCompressorCategory(categories)

    return listOfNotNull(
        findPanelCategory(categories),
        findRefrigerantCategory(categories),
        findCoolingCategory(categories),
        compressor,
    ).distinctBy { it.id }.take(4)
}

internal fun popularCategoryLabel(
    category: CategoriesListModel,
    compressorsLabel: String,
): String {
    return if (isCompressorCategory(category)) compressorsLabel else category.name
}

@DrawableRes
internal fun popularCategoryImageRes(category: CategoriesListModel): Int? {
    if (isCompressorCategory(category)) return R.drawable.home_category_compressors
    val slug = category.slug.lowercase()
    val name = category.name.lowercase()
    return when {
        slug.contains("panel") || name.contains("panel") -> R.drawable.home_category_panel
        slug.contains("kaelt") || slug.contains("kält") || name.contains("kaelt") ||
            name.contains("kält") || name.contains("refrigerant") ->
            R.drawable.home_category_refrigerant
        slug.contains("kuehl") || slug.contains("vitrin") || name.contains("kuehl") ||
            name.contains("kühl") || name.contains("vitrin") || name.contains("schran") ->
            R.drawable.home_category_cooling_display
        else -> null
    }
}

private fun findPanelCategory(categories: List<CategoriesListModel>): CategoriesListModel? {
    return categories.firstOrNull {
        it.slug.equals("panel", ignoreCase = true) ||
            it.slug.contains("panel", ignoreCase = true) ||
            it.name.contains("panel", ignoreCase = true)
    }
}

private fun findRefrigerantCategory(categories: List<CategoriesListModel>): CategoriesListModel? {
    return categories.firstOrNull {
        it.slug.contains("kaelt", ignoreCase = true) ||
            it.slug.contains("kält", ignoreCase = true) ||
            it.name.contains("kaelt", ignoreCase = true) ||
            it.name.contains("kält", ignoreCase = true) ||
            it.name.contains("refrigerant", ignoreCase = true)
    }
}

private fun findCoolingCategory(categories: List<CategoriesListModel>): CategoriesListModel? {
    return categories.firstOrNull {
        it.slug.contains("kuehl", ignoreCase = true) ||
            it.slug.contains("vitrin", ignoreCase = true) ||
            it.name.contains("kuehl", ignoreCase = true) ||
            it.name.contains("kühl", ignoreCase = true) ||
            it.name.contains("vitrin", ignoreCase = true) ||
            it.name.contains("schran", ignoreCase = true)
    }
}

private fun isCompressorCategory(category: CategoriesListModel): Boolean {
    if (category.slug.equals("kompressoren", ignoreCase = true)) return true
    if (category.slug.equals("verdichter", ignoreCase = true)) return true
    if (category.slug.startsWith("verdichter-", ignoreCase = true)) return true
    if (category.name.equals("Kompressoren", ignoreCase = true)) return true
    if (category.slug.contains("embraco-compressors", ignoreCase = true)) return true
    if (category.slug.contains("compressor", ignoreCase = true) &&
        !category.slug.contains("accessories", ignoreCase = true)
    ) {
        return true
    }
    return category.name.contains("Kompressor", ignoreCase = true) ||
        category.name.contains("compressor", ignoreCase = true) ||
        category.name.contains("Verdichter", ignoreCase = true)
}

private fun findCompressorCategory(categories: List<CategoriesListModel>): CategoriesListModel? {
    return categories.firstOrNull { it.slug.equals("embraco-compressors", ignoreCase = true) }
        ?: categories.firstOrNull { it.slug.equals("kompressoren", ignoreCase = true) }
        ?: categories.firstOrNull { it.name.equals("Kompressoren", ignoreCase = true) }
        ?: categories.firstOrNull { it.slug.equals("verdichter", ignoreCase = true) }
        ?: categories.firstOrNull { it.slug.startsWith("verdichter-", ignoreCase = true) }
        ?: categories.firstOrNull {
            it.slug.contains("compressor", ignoreCase = true) &&
                !it.slug.contains("accessories", ignoreCase = true)
        }
        ?: categories.firstOrNull {
            it.name.contains("Kompressor", ignoreCase = true) ||
                it.name.contains("compressor", ignoreCase = true) ||
                it.name.contains("Verdichter", ignoreCase = true)
        }
}
