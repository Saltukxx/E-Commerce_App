package com.himanshu_kumar.domain.catalog

/**
 * German display labels for catalog categories. API data may use ASCII or Turkish names;
 * UI should always show these localized labels.
 */
object CategoryDisplayNames {

    private val bySlug = mapOf(
        "panel" to "Panel",
        "kaeltemittel" to "Kältemittel",
        "kuehlschraenke-vitrinen" to "Kühlschränke & Vitrinen",
        "elektromaterial" to "Elektromaterial",
        "isolierte-rohre" to "Isolierte Rohre",
        "kuehlaggregate" to "Kühlanlagen",
        "verdichter-scroll" to "Scroll-Verdichter",
        "verfluessigereinheiten" to "Verflüssigereinheiten",
        "klimasysteme" to "Klimasysteme",
        "verdampfer" to "Verdampfer",
        "kuehlraum-zubehoer" to "Kühlraum-Zubehör",
        "kuehlraumtueren" to "Kühlraumtüren",
        "verdichter" to "Verdichter",
        "kuehloele" to "Kühlöle",
        "isolierung-klebebaender" to "Isolierung & Klebebänder",
        "elektronische-regler" to "Elektronische Regler",
        "pumpen-entwaesserung" to "Pumpen & Entwässerung",
        "filter-trockner" to "Filter & Trockner",
        "ventile-regler" to "Ventile & Regler",
        "leitungszubehoer" to "Leitungszubehör",
        "ventilatormotoren" to "Ventilatormotoren",
        "sammler-fluessigkeitsbehaelter" to "Sammler (Flüssigkeitsbehälter)",
        "kuehltechnik-zubehoer" to "Kühltechnik-Zubehör",
        "bakir-borular" to "Kupferrohre",
        "klima-yedek-parcalari" to "Klima-Ersatzteile",
        "termostat-ve-termometreler" to "Thermostate & Thermometer",
        "kaynak-telleri" to "Lötdrähte",
        "embraco-compressors" to "Embraco Kompressoren",
        "cubigel-compressors" to "Cubigel Kompressoren",
        "secop-compressors" to "Secop Kompressoren",
        "tecumseh-compressors" to "Tecumseh Kompressoren",
        "scroll-compressors" to "Scroll-Kompressoren",
        "semihermetic-compressors" to "Semihermetische Kompressoren",
        "compressors-accessories" to "Kompressoren-Zubehör",
    )

    private val byExactName = mapOf(
        "Bakir Borular" to "Kupferrohre",
        "Bakır Borular" to "Kupferrohre",
        "Klima Yedek Parçaları" to "Klima-Ersatzteile",
        "Klima Yedek Parcalari" to "Klima-Ersatzteile",
        "Termostat ve Termometreler" to "Thermostate & Thermometer",
        "Kaynak Telleri" to "Lötdrähte",
        "Kaeltemittel" to "Kältemittel",
        "Kuehlschraenke & Vitrinen" to "Kühlschränke & Vitrinen",
        "Kuehlaggregate" to "Kühlanlagen",
        "Verdichter > Scroll" to "Scroll-Verdichter",
        "Verfluessigereinheiten" to "Verflüssigereinheiten",
        "Kuehlraum-Zubehoer" to "Kühlraum-Zubehör",
        "Kuehlraumtueren" to "Kühlraumtüren",
        "Kuehloele" to "Kühlöle",
        "Isolierung & Klebebaender" to "Isolierung & Klebebänder",
        "Pumpen & Entwaesserung" to "Pumpen & Entwässerung",
        "Leitungszubehoer" to "Leitungszubehör",
        "Sammler (Fluessigkeitsbehaelter)" to "Sammler (Flüssigkeitsbehälter)",
        "Kuehltechnik-Zubehoer" to "Kühltechnik-Zubehör",
        "Embraco compressors" to "Embraco Kompressoren",
    )

    fun germanName(slug: String, fallbackName: String): String {
        bySlug[slug.lowercase()]?.let { return it }
        byExactName[fallbackName]?.let { return it }
        byExactName.entries.firstOrNull { (key, _) ->
            key.equals(fallbackName, ignoreCase = true)
        }?.value?.let { return it }
        return fallbackName
    }
}
