import { mediaRefSelect } from "../media/select";

/** Feeds utils/mappers/settings.toSettingsResponse(). */
export const settingsInclude = {
  logoMedia: { select: mediaRefSelect },
  iconMedia: { select: mediaRefSelect },
  faviconMedia: { select: mediaRefSelect },
  youtubeThumbMedia: { select: mediaRefSelect },
  contacts: { orderBy: { position: "asc" } },
  socialLinks: { orderBy: { platform: "asc" } },
} as const;
