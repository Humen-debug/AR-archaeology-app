import feathers, { Application } from "@feathersjs/feathers";

declare module "@feathersjs/feathers" {
  interface Application {
    apiURL: string;
    /**
     *
     * @param url registered service path, especially for attachments
     * @param data POST body
     * @param params POST params
     */
    post(url: string, data: any, params: any): Promise<any>;
  }
}
