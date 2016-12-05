/**
 *   api-client.ts
 *   Copyright (c) 345 Systems LLP 2016, all rights reserved.
 *
 *   cloco client, used to retrieve configuration data.
 */
import * as restify from "restify";
import { Logger } from "./logging/logger";
import { AccessTokenResponse } from "./types/access-token-response";
import { IOptions } from "./types/ioptions";
import { ClocoApp, ConfigObjectWrapper } from "./types/clocoapp";
import { TokenRequest } from "./types/token-request";

/**
 * Class to provide static accessors over the restify client promises.
 */
export class ApiClient {

  /**
   * Retrieves the application from the api.
   * @param  {IOptions}          options The initialization options.
   * @return {Promise<ClocoApp>}         A promise of the application.
   */
  public static async getApplication(options: IOptions): Promise<ClocoApp> {

    Logger.log.trace("ApiClient.getApplication: start");

    // initialise the restify client.
    let client: restify.Client = restify.createJsonClient(ApiClient.getRestifyOptions(options));
    let path: string = `/${options.subscription}/applications/${options.application}`;
    Logger.log.trace("ApiClient.getApplication: Calling API", {url: options.url}, {path: path});

    return new Promise<ClocoApp>(
        function(
            resolve: (value: ClocoApp) => void,
            reject: (reason: Error) => void): void {

            client.get(
                path,
                function(err: Error, req: restify.Request, res: restify.Response, obj: ClocoApp): void {
                    if (err) {
                        Logger.log.error(err, "ApiClient.getApplication: Error getting application.");
                        reject(err);
                    } else {
                        Logger.log.trace("ApiClient.getApplication: Application received.", {data: obj});
                        resolve(obj);
                    }
                });
        });
  }

  /**
   * Retrieves the application from the api.
   * @param  {IOptions}           options           The initialization options.
   * @param  {string}             objectId          The config object id.
   * @return {Promise<ConfigObjectWrapper>}         A promise of the config object.
   */
  public static async getConfigObject(options: IOptions, objectId: string): Promise<ConfigObjectWrapper> {

    Logger.log.trace("ApiClient.getConfigObject: start");

    // initialise the restify client.
    let client: restify.Client = restify.createJsonClient(ApiClient.getRestifyOptions(options));
    let path: string = `/${options.subscription}/configuration/${options.application}/${objectId}/${options.environment}`;
    Logger.log.trace("ApiClient.getConfigObject: Calling API", {url: options.url}, {path: path});

    return new Promise<ConfigObjectWrapper>(
        function(
            resolve: (value: ConfigObjectWrapper) => void,
            reject: (reason: Error) => void): void {

            client.get(
                path,
                function(err: Error, req: restify.Request, res: restify.Response, obj: ConfigObjectWrapper): void {
                    if (err) {
                        Logger.log.error(err, "ApiClient.getConfigObject: Error getting configuration object.");
                        reject(err);
                    } else {
                        Logger.log.trace("ApiClient.getConfigObject: Configuration object wrapper received.", { data: obj });
                        resolve(obj);
                    }
                });
        });
  }

  /**
   * Writes the config object to the server.
   * @param  {IOptions}      options  The options.
   * @param  {string}        objectId The object Id.
   * @param  {any}           body     The item to write.
   * @return {Promise<ConfigObjectWrapper>}          A promise of the work completing.
   */
  public static async putConfigObject(options: IOptions, objectId: string, body: any): Promise<ConfigObjectWrapper> {

    Logger.log.trace("ApiClient.putConfigObject: start");

    // initialise the restify client.
    let client: restify.Client;
    let parseResponse: boolean = false;

    if (typeof body === "string") {
      Logger.log.trace("ApiClient.putConfigObject: creating string client.");
      client = restify.createStringClient(ApiClient.getRestifyOptions(options));
      parseResponse = true;
    } else {
      Logger.log.trace("ApiClient.putConfigObject: creating JSON client.");
      client = restify.createJsonClient(ApiClient.getRestifyOptions(options));
    }

    let path: string = `/${options.subscription}/configuration/${options.application}/${objectId}/${options.environment}`;
    Logger.log.trace("ApiClient.putConfigObject: Calling API", {url: options.url}, {path: path});

    return new Promise<ConfigObjectWrapper>(
        function(
            resolve: (value: ConfigObjectWrapper) => void,
            reject: (reason: Error) => void): void {

            client.put(
                path,
                body,
                function(err: Error, req: restify.Request, res: restify.Response, obj: any): void {
                    if (err) {
                        Logger.log.error(err, "ApiClient.putConfigObject: Error writing data.");
                        reject(err);
                    } else {
                        if (parseResponse) {
                          obj = JSON.parse(obj);
                        }
                        Logger.log.trace("ApiClient.putConfigObject: Success response received.", { data: obj });
                        resolve(obj);
                    }
                });
        });
  }

  /**
   * Refreshes the bearer token.
   * @param  {IOptions}          options The initialization options.
   * @return {Promise<AccessTokenResponse>}         A promise of the access token.
   */
  public static async getAccessTokenFromRefreshToken(options: IOptions): Promise<AccessTokenResponse> {

    Logger.log.trace("ApiClient.getAccessTokenFromRefreshToken: start");

    // initialise the restify client.
    let client: restify.Client = restify.createJsonClient(ApiClient.getRestifyOptions(options));
    let path: string = `/oauth/token`;
    let body: TokenRequest = new TokenRequest();
    body.grant_type = "refresh_token";
    body.refresh_token = options.tokens.refreshToken;
    Logger.log.trace("ApiClient.getAccessTokenFromRefreshToken: Calling API", {url: options.url}, {path: path});

    return new Promise<AccessTokenResponse>(
        function(
            resolve: (value: AccessTokenResponse) => void,
            reject: (reason: Error) => void): void {

            client.post(
                path,
                body,
                function(err: Error, req: restify.Request, res: restify.Response, obj: AccessTokenResponse): void {
                    if (err) {
                        Logger.log.error(err, "ApiClient.getAccessTokenFromRefreshToken: Error getting access token.");
                        reject(err);
                    } else {
                        Logger.log.trace("ApiClient.getAccessTokenFromRefreshToken: Access token response received.");
                        resolve(obj);
                    }
                });
        });
  }

  /**
   * Refreshes the bearer token.
   * @param  {IOptions}          options The initialization options.
   * @return {Promise<AccessTokenResponse>}         A promise of the access token.
   */
  public static async getAccessTokenFromClientCredentials(options: IOptions): Promise<AccessTokenResponse> {

    Logger.log.trace("ApiClient.getAccessTokenFromClientCredentials: start");

    // initialise the restify client.
    let client: restify.Client = restify.createJsonClient(ApiClient.getRestifyOptions(options, "basic"));
    let path: string = `/oauth/token`;
    let body: TokenRequest = new TokenRequest();
    body.grant_type = "client_credentials";
    Logger.log.trace("ApiClient.getAccessTokenFromClientCredentials: Calling API", {url: options.url}, {path: path});

    return new Promise<AccessTokenResponse>(
        function(
            resolve: (value: AccessTokenResponse) => void,
            reject: (reason: Error) => void): void {

            client.post(
                path,
                body,
                function(err: Error, req: restify.Request, res: restify.Response, obj: AccessTokenResponse): void {
                    if (err) {
                        Logger.log.error(err, "ApiClient.getAccessTokenFromClientCredentials: Error getting access token.");
                        reject(err);
                    } else {
                        Logger.log.trace("ApiClient.getAccessTokenFromClientCredentials: Access token response received.");
                        resolve(obj);
                    }
                });
        });
  }

  /**
   * Gets the restify options based on the settings.
   * @param  {IOptions}              options The options.
   * @return {restify.ClientOptions}         The restify client options.
   */
  private static getRestifyOptions(options: IOptions, credentialType?: string): restify.ClientOptions {

    Logger.log.trace("ApiClient.getRestifyOptions: start");

    let restifyOptions: restify.ClientOptions = {
        url: options.url,
        version: "*",
    };

    let headers: any = {};

    if (credentialType === "basic") {
      Logger.log.trace("ApiClient.getRestifyOptions: generating auth header with client credentials.");
      let encoded: string = new Buffer(`${options.credentials.key}:${options.credentials.secret}`).toString("base64");
      headers.authorization = `Basic ${encoded}`;
    } else {
        Logger.log.trace("ApiClient.getRestifyOptions: generating auth header with bearer token.");
        headers.authorization = `Bearer ${options.tokens.accessToken}`;
    }

    restifyOptions.headers = headers;

    Logger.log.trace("ApiClient.getRestifyOptions: end");

    return restifyOptions;
  }
}
