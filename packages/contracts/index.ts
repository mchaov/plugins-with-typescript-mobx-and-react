
export type MessageBus = {
    eventNames(): any[]
    listeners(event: any): Function[]
    emit(event: any, ...args: Array<any>): void
    on(event: any, fn: (...args: any[]) => void, context?: any): void
    off(event: any, fn: (...args: any[]) => void, context?: any): void
}

export const MessageBusChannels = {
    callToRegister: "CallToRegister",
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

export interface IBl {
    activate(): void
    deactivate(): void
    mBus: MessageBus
    status: ComponentStatus
}