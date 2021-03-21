declare interface Fn<T = any, R = T> {
  (...arg: T[]): R
}

declare interface PromiseFn<T = any, R = T> {
  (...arg: T[]): Promise<R>
}

declare interface Obj<T = any> {
  [key: string]: T
  [key: number]: T
}

type State = Obj

declare type Data = Record<string, unknown>

declare type KeyOf<T> = keyof T

declare function parseInt(s: string | number, radix?: number): number

declare function parseFloat(string: string | number): number

declare type Dictionary<T> = Record<string, T>

declare type Nullable<T> = T | null | undefined

declare type RefInstanceType<T> = {
  $: T
} | null

declare type RefType<T> = T | null

declare type CustomizedHTMLElement<T> = HTMLElement & T

declare type Indexable<T = any> = {
  [key: string]: T
}

declare type Hash<T> = Indexable<T>

declare type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

declare type LabelValueOptions = {
  label: string
  value: any
}[]

declare type EmitType = (event: string, ...args: any[]) => void

declare type TargetContext = '_self' | '_blank'

declare type TimeoutHandle = ReturnType<typeof setTimeout>

declare type IntervalHandle = ReturnType<typeof setInterval>

declare type Noop = (...args: any[]) => any

declare const IS_WEB: boolean
declare const IS_MAC: boolean
declare const __DEV: boolean
declare const __TEST: boolean
declare const __static: string
