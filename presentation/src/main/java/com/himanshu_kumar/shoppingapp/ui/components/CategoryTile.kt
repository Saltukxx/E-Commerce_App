package com.himanshu_kumar.shoppingapp.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.himanshu_kumar.domain.model.CategoriesListModel
import com.himanshu_kumar.shoppingapp.R
import kotlin.math.abs

@Composable
fun CategoryItem(
    category: CategoriesListModel,
    tilePalette: List<Color>,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    val tint = tilePalette[abs(category.id) % tilePalette.size]
    val labelColor = colorResource(R.color.category_tile_on)
    Box(
        modifier = modifier
            .defaultMinSize(minWidth = 148.dp, minHeight = 72.dp)
            .semantics { contentDescription = category.name }
            .clip(RoundedCornerShape(14.dp))
            .background(tint)
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = category.name,
            style = MaterialTheme.typography.labelLarge.copy(
                fontWeight = FontWeight.SemiBold,
            ),
            color = labelColor,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
        )
    }
}
