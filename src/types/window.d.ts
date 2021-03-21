import type { App, ComponentPublicInstance } from 'vue'

declare global {
  declare interface Window {
    app: App<Element>
  }
}
