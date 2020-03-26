declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV?: string;
    MQTT_BROKER: string;
    TADO_EMAIL: string;
    TADO_PASSWORD: string;
    ADDRESS?: string;
    PORT?: string;
  }
}