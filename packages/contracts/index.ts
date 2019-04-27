
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
    init = 0,
    void = -1,
    active = 1,
    inactive = 2
}

export interface IComponent {
    activate(): void
    deactivate(): void
    status: ComponentStatus
}

export interface IBl extends IComponent {
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
}