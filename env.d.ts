/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GEMINI_API_KEY?: string
	readonly VITE_PREVIEW?: string
	readonly VITE_LOCALE?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
