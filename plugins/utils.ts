import { logger } from "react-native-logs";

var log = logger.createLogger();

log.setSeverity("debug");

export { log };

export function getThumb(image: string | any) {
  if (typeof image === "string") return `${process.env.EXPO_PUBLIC_API_URL}/api/attachments/${image}.jpg`;
  else if (image && image._id) {
    return `${process.env.EXPO_PUBLIC_API_URL}/api/attachments/${image._id}.jpg`;
  }
}
