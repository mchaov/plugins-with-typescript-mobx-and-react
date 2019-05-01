
export type MessageBus = {
    eventNames(): any[]
    listeners(event: any): Function[]
    emit(event: any, ...args: any[]): void
    on(event: any, fn: (...args: any[]) => void, context?: any): void
    off(event: any, fn: (...args: any[]) => void, context?: any): void
}

export const MessageBusChannels = {
    callToRegisterBl: "CallToRegisterBl",
    callToRegisterPlugins: "CallToRegisterPlugins",
    register: {
        bl: "Register.Bl",
        plugin: "Register.Plugin",
    }
}

export enum ComponentStatus {
    void = "void",
    init = "initialized",
    active = "activated",
    inactive = "deactivated"
}

export interface IComponent {
    deactivate(): void
    status: ComponentStatus
    activate(...params: any): void
}

export interface IImage {
    id: string
    url: string
    name: string
    label: string
}

export interface IBl extends IComponent {
    data: IImage[]
    availablePlugins: string[]
    activePlugin: IPlugin | undefined
    activatePlugin: (pluginName: string) => void
}

export interface IPluginAPI {
    ui: JSX.Element | undefined
}

export interface IPlugin extends IComponent {
    name: string
    api: IPluginAPI
    activate(data: IImage[]): void
}