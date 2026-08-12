import { Platform, useWindowDimensions } from 'react-native';

export function useTabletLandscapeLayout() {
  const { height, width } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= tabletMinimumHeight;
  const isTabletLandscape = isTablet && width > height;
  const isTabletPortrait = isTablet && !isTabletLandscape;
  const contentWidth = Math.max(
    0,
    width - tabletLandscapePagePadding * 2 - tabletLandscapeColumnGap,
  );
  const playerPaneWidth =
    contentWidth * (playerColumnRatio / combinedColumnRatio);
  const playlistPaneWidth = contentWidth - playerPaneWidth;
  const availablePlayerHeight = Math.max(
    minimumPlayerHeight,
    height - tabletPlayerReservedHeight,
  );
  const portraitContentWidth = Math.min(
    width - tabletPortraitPagePadding * 2,
    tabletPortraitMaximumContentWidth,
  );

  return {
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    playerPaneWidth,
    playerHeight: Math.min(
      playerPaneWidth / playerAspectRatio,
      availablePlayerHeight,
    ),
    playlistPaneWidth,
    portraitContentWidth,
    portraitPlayerWidth: portraitContentWidth - tabletPortraitContentInset * 2,
    width,
  };
}

const minimumPlayerHeight = 200;
const playerAspectRatio = 16 / 9;
const playerColumnRatio = 1.55;
const playlistColumnRatio = 1;
const combinedColumnRatio = playerColumnRatio + playlistColumnRatio;
const tabletMinimumHeight = 500;
const tabletPlayerReservedHeight = 480;

export const tabletLandscapeColumnGap = 16;
export const tabletLandscapePagePadding = 16;
export const tabletPortraitPagePadding = 16;
export const tabletPortraitMaximumContentWidth = 760;
export const tabletPortraitContentInset = 16;
export const tabletNavigationHeight = 64;
export const tabletPlayerTopOffset =
  Platform.OS === 'ios' ? 52 : tabletNavigationHeight;
export const tabletRoomHeaderHeight = 80;
