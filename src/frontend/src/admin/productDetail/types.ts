export type SupportedLocale = 'zh' | 'en'

export type I18nText = Partial<Record<SupportedLocale, string>>

export type GalleryItem = {
    id?: string
    url: string
    objectKey?: string
    alt_i18n?: I18nText
}

export type SpecRow = {
    key: string
    label_i18n?: I18nText
    value_i18n?: I18nText

    // legacy-friendly fallbacks (kept for backward compatibility)
    k?: string
    label?: string
    v?: string
    value?: string
}

export type OptionItem = {
    key: string
    label_i18n?: I18nText

    // legacy-friendly fallbacks
    label?: string
    name?: string
    value?: string
}

export type OptionGroup = {
    key: string
    name_i18n?: I18nText
    options: OptionItem[]

    // legacy-friendly fallbacks
    name?: string
    title?: string
    label?: string
}

export type DetailSectionArea = 'media' | 'sticky' | 'main' | 'aside'

export type DetailSectionBase = {
    id: string
    type: string
    area: DetailSectionArea
    title_i18n?: I18nText
}

export type GallerySection = DetailSectionBase & {
    type: 'gallery'
    area: 'media'
    props?: {
        includeCoverHover?: boolean
    }
}

export type OptionsSection = DetailSectionBase & {
    type: 'options'
    area: 'sticky'
}

export type RichTextSection = DetailSectionBase & {
    type: 'richText'
    area: 'main' | 'sticky'
    data?: {
        text_i18n?: I18nText
    }
}

export type SpecsSection = DetailSectionBase & {
    type: 'specs'
    area: 'main'
}

export type ServiceSection = DetailSectionBase & {
    type: 'service'
    area: 'aside'
}

export type DividerSection = DetailSectionBase & {
    type: 'divider'
    area: 'main' | 'sticky' | 'aside'
}

export type DetailSection =
    | GallerySection
    | OptionsSection
    | RichTextSection
    | SpecsSection
    | ServiceSection
    | DividerSection

export type ProductDetailV2 = {
    schema_version: 2

    // content data
    gallery?: GalleryItem[]
    specs?: SpecRow[]
    option_groups?: OptionGroup[]

    // layout
    sections: DetailSection[]

    // keep a generic escape hatch
    [k: string]: unknown
}
