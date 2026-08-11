import { Platform, useWindowDimensions } from 'react-native';

export function useTabletLandscapeLayout() {
  const { height, width } = useWindowDimensions();
  const isTabletLandscape = width > height && height >= tabletMinimumHeight;
  const contentWidth = Math.max(
    0,
    width - tabletLandscapePagePadding * 2 - tabletLandscapeColumnGap,
  );
  const playerPaneWidth =
    contentWidth * (playerColumnRatio / combinedColumnRatio);
  const playlistPaneWidth = contentWidth - playerPaneWidth;
  const responsivePlayerHeight = height - tabletVerticalChromeHeight;

  return {
    isTabletLandscape,
    playerPaneWidth,
    playerHeight: Math.max(
      minimumPlayerHeight,
      playerPaneWidth / playerAspectRatio,
      responsivePlayerHeight,
    ),
    playlistPaneWidth,
    width,
  };
}

const minimumPlayerHeight = 200;
const playerAspectRatio = 16 / 9;
const playerColumnRatio = 1.55;
const playlistColumnRatio = 1;
const combinedColumnRatio = playerColumnRatio + playlistColumnRatio;
const tabletMinimumHeight = 600;

export const tabletLandscapeColumnGap = 16;
export const tabletLandscapePagePadding = 16;
export const tabletPlayerTopOffset = Platform.OS === 'ios' ? 48 : 0;
export const tabletRoomHeaderHeight = 80;

const tabletVerticalChromeHeight = 440;
