type Config = { host: string };

/**
 * Connect to the server.
 * @param {Config} config server configuration
 */
function connect(config: Config): void {
  console.log(config.host);
}

export { connect };
