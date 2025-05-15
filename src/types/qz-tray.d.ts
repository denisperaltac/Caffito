declare module "qz-tray" {
  interface QZ {
    websocket: {
      isActive(): boolean;
      connect(): Promise<void>;
      disconnect(): Promise<void>;
    };
    print(config: any): Promise<void>;
  }

  const qz: QZ;
  export default qz;
}
