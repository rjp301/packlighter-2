type ENV = {} & import("./envs").Environment;

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
  interface Locals extends Runtime {
    session: import("./lib/types").UserSessionInfo | null;
    user: import("./lib/types").UserSelect | null;
    env: Env;
  }
}
