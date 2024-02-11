export { default as ArrowUpIcon } from "@assets/icons/arrow-up.svg";
export { default as BackpackIcon } from "@assets/icons/backpack.svg";
export { default as BookmarkOutlineIcon } from "@assets/icons/bookmark-outline.svg";
export { default as BookmarkIcon } from "@assets/icons/bookmark.svg";
export { default as BoxIcon } from "@assets/icons/box.svg";
export { default as CalendarIcon } from "@assets/icons/calendar-fill.svg";
export { default as CalendarOutlinedIcon } from "@assets/icons/calendar-line.svg";
export { default as ChevronLeftIcon } from "@assets/icons/chevron-left.svg";
export { default as ChevronRightSharpIcon } from "@assets/icons/chevron-right-sharp.svg";
export { default as CreateARIcon } from "@assets/icons/create-ar.svg";
export { default as CompassIcon } from "@assets/icons/compass.svg";
export { default as ErrorOutlineIcon } from "@assets/icons/error-outline.svg";
export { default as FootStepsIcon } from "@assets/icons/footsteps.svg";
export { default as ExploreIcon } from "@assets/icons/explore.svg";
export { default as ForwardIcon } from "@assets/icons/forward.svg";
export { default as GPSIcon } from "@assets/icons/gps.svg";
export { default as HelpIcon } from "@assets/icons/help.svg";
export { default as HomeIcon } from "@assets/icons/home.svg";
export { default as LocateIcon } from "@assets/icons/locate.svg";
export { default as LocationIcon } from "@assets/icons/location.svg";
export { default as MenuIcon } from "@assets/icons/menu.svg";
export { default as MoonIcon } from "@assets/icons/moon.svg";
export { default as MoonFillIcon } from "@assets/icons/moon-fill.svg";
export { default as MountainIcon } from "@assets/icons/mountain.svg";
export { default as PauseDarkIcon } from "@assets/icons/pause-dark.svg";
export { default as PlayDarkIcon } from "@assets/icons/play-dark.svg";
export { default as ProfileIcon } from "@assets/icons/profile.svg";
export { default as ReplayIcon } from "@assets/icons/replay.svg";
export { default as SearchIcon } from "@assets/icons/search.svg";
export { default as SettingIcon } from "@assets/icons/setting.svg";
export { default as ShareIcon } from "@assets/icons/share.svg";
export { default as SortIcon } from "@assets/icons/sort.svg";
export { default as SuccessCircleIcon } from "@assets/icons/success-circle.svg";
export { default as TimeIcon } from "@assets/icons/time.svg";
export { default as TimeOutlineIcon } from "@assets/icons/time-outline.svg";

import { ViewProps } from "react-native";
import { SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps, ViewProps {
  fill?: string;
  size?: number;
}
