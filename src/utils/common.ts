import type { NavigateFunction, Location } from "react-router";

export function goBack(
  navigate: NavigateFunction,
  location: Location,
  navigateUrl: string,
) {
  if (location.key !== "default") navigate(-1);
  else navigate(navigateUrl);
}
