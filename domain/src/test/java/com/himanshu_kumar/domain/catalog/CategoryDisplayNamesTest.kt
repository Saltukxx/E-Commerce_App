package com.himanshu_kumar.domain.catalog

import org.junit.Assert.assertEquals
import org.junit.Test

class CategoryDisplayNamesTest {

    @Test
    fun `turkish category slugs map to German labels`() {
        assertEquals("Kupferrohre", CategoryDisplayNames.germanName("bakir-borular", "Bakir Borular"))
        assertEquals(
            "Klima-Ersatzteile",
            CategoryDisplayNames.germanName("klima-yedek-parcalari", "Klima Yedek Parçaları"),
        )
        assertEquals(
            "Thermostate & Thermometer",
            CategoryDisplayNames.germanName("termostat-ve-termometreler", "Termostat ve Termometreler"),
        )
        assertEquals("Lötdrähte", CategoryDisplayNames.germanName("kaynak-telleri", "Kaynak Telleri"))
    }

    @Test
    fun `ascii German categories gain umlauts`() {
        assertEquals("Kältemittel", CategoryDisplayNames.germanName("kaeltemittel", "Kaeltemittel"))
        assertEquals(
            "Kühlschränke & Vitrinen",
            CategoryDisplayNames.germanName("kuehlschraenke-vitrinen", "Kuehlschraenke & Vitrinen"),
        )
    }
}
