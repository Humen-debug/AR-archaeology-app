import { createContext, useContext } from "react";
import { feathers, Application, Paginated } from "@feathersjs/feathers";
import fio from "@feathersjs/socketio-client";
import socketio from "socket.io-client";

export { Paginated };

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

  socket.on("reconnect", function () {
    console.log("Socket reconnected");
  });
  socket.on("disconnect", function () {
    console.log("Socket disconnects");
    connected = false;
  });
  socket.on("connect_error", (err) => {
    console.warn("Server disconnect");
  });
  // Set up Socket.io client with the socket. Timeout as 3 minutes
  let app: Application = feathers().configure(fio(socket, { timeout: 1800000 }));

  app.post = async function (url: string, data: any, params: any) {
    // authentication with token in header
    return fetch(`${apiURL}/${url}`, {
      method: "POST",
      body: data,
      ...params,
    });
  };

  app.on("login", (authRes) => {});
  app.on("logout", (args) => {});

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
  const feathers = createClient(baseURL ?? process.env.EXPO_PUBLIC_API_URL);
  return <FeathersContext.Provider value={feathers}>{children}</FeathersContext.Provider>;
};

export const useFeathers = () => {
  const feathers = useContext(FeathersContext);
  if (!feathers) throw new Error("useFeathers must be used inside FeathersProvider");
  return feathers;
};
