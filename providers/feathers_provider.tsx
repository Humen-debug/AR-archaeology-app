import { createContext, PropsWithChildren, useContext } from "react";
import { feathers, Application } from "@feathersjs/feathers";
import fio from "@feathersjs/socketio-client";
import socketio from "socket.io-client";

let connected = false;
function createClient(baseURL?: string) {
  let apiURL = "";
  let baseHost = "";
  if (baseURL) {
    baseHost = baseURL;
  }
  apiURL = baseHost + "/api";

  const socket = socketio(baseHost, {
    path: "/api/socket.io",
    transports: ["websocket"],
    forceNew: true,
  });
  socket.on("connect", function () {
    console.log("Socket connected");
    connected = true;
  });

  socket.on("reconnect", function () {});
  socket.on("disconnect", function () {
    console.log("Socket disconnects");
    connected = false;
  });
  socket.on("connect_error", (err) => {
    console.warn("Server disconnect");
  });
  // Set up Socket.io client with the socket. Timeout as 3 minutes
  let app: Application = feathers().configure(fio(socket, { timeout: 1800000 }));

  // TODO add authentication

  app.post = async function (url: string, data: any, params: any) {
    // authentication with token in header
    return fetch(`${apiURL}/${url}`, {
      method: "POST",
      body: data,
      ...params,
    });
  };

  app.on("login", (authRes) => console.log(`login ${authRes}`));
  app.on("logout", (args) => console.log(`logout ${args}`));

  app.apiURL = apiURL;

  console.log("Feathers-Client using url:", apiURL);

  return app;
}

interface Props {
  children: React.ReactNode;
  baseURL?: string;
}

const FeathersContext = createContext<Application | null>(null);
export const FeathersProvider = ({ children, baseURL }: Props) => {
  const feathers = createClient(baseURL ?? "http://192.168.1.58:3002");
  return <FeathersContext.Provider value={feathers}>{children}</FeathersContext.Provider>;
};

export const useFeathers = () => {
  const feathers = useContext(FeathersContext);
  if (!feathers) throw new Error("useFeathers must be used inside FeathersProvider");
  return feathers;
};
