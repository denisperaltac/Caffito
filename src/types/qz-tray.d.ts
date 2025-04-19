declare module "qz-tray" {
  export const qz: {
    websocket: {
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      isActive(): boolean;
    };
    printers: {
      find(name: string): Promise<string>;
    };
    print(config: any): Promise<any>;
  };
}
