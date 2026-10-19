import { classNames } from '@vibes/shared';
import { Button, PlusIcon } from '@vibes/ui/web';
import { AnimatePresence, m as motion } from 'framer-motion';
import { lazy, Suspense } from 'preact/compat';
import { DeferredModalLoading } from '../components/DeferredModalLoading';
import { DeferredRoomGenerationProgress as RoomGenerationProgress } from '../components/DeferredRoomGenerationProgress';
import { RoomConnections } from '../components/RoomConnections';
import { RoomHeader } from '../components/RoomHeader';
import { RoomPlayer } from '../components/RoomPlayer';
import { RoomQueue } from '../components/RoomQueue';
import { roomEntryTransition, roomEntryVisibleState } from '../constants';
import { useRoomView } from '../hooks/useRoomView';
import { loadAddToQueueModal } from '../utils/preloadQueueModal';
import { RoomOverlayPanels } from './RoomOverlayPanels';

const LazyPartyScreenJoinCard = lazy(async () => {
  const module = await import('../components/PartyScreenJoinCard');

  return {
    default: module.PartyScreenJoinCard,
  };
});

const LazyDeviceSelector = lazy(async () => {
  const module = await import('../../../components/cast/DeviceSelector');

  return {
    default: module.DeviceSelector,
  };
});

const LazyAddToQueueModal = lazy(loadAddToQueueModal);

export function RoomView() {
  const {
    loaderData,
    prefetchPanel,
    id,
    headerRef,
    shareButtonRef,
    sharePanelRef,
    settingsButtonRef,
    settingsMenuRef,
    isAdmin,
    isCastInitialized,
    isCasting,
    castDeviceName,
    isSSR,
    queuePreviewProps,
    playerPreloadProps,
    isAddModalVisible,
    showShare,
    showSettings,
    focusAdminLogin,
    showDeviceSelector,
    adminPassword,
    setAdminPassword,
    isGenerating,
    generationError,
    displayRoom,
    shareUrl,
    isAuthenticating,
    adminError,
    showGenerationProgress,
    isPartyScreen,
    chatOpen,
    setChatOpen,
    handleAddPlaylistItem,
    handleCloseAddPlaylistItem,
    handleOpenCast,
    handleCloseCast,
    handleToggleShare,
    handleOpenPartyScreen,
    handleExitPartyScreen,
    handleToggleSettings,
    handleOpenAdminLogin,
    handleCloseSettings,
    handleGenerationStarted,
    handleShareRoom,
    handleJoinAdmin,
    handleLeave,
    roomEntryInitial,
  } = useRoomView();

  return (
    <>
      <RoomConnections providers={loaderData.providers} />
      <motion.div
        animate={roomEntryVisibleState}
        className={classNames(
          'room-entry relative min-h-screen w-full min-w-0 overflow-x-hidden lg:h-dvh lg:min-h-0 lg:overflow-hidden',
          isPartyScreen && 'bg-theme',
        )}
        initial={roomEntryInitial}
        transition={roomEntryTransition}
      >
        <main className="relative z-10 flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden lg:h-dvh lg:min-h-0 lg:overflow-hidden">
          {!isPartyScreen && (
            <RoomHeader
              adminError={adminError}
              key="room-header"
              headerRef={headerRef}
              displayRoom={displayRoom}
              roomId={id}
              prefetchPanel={prefetchPanel}
              showShare={showShare}
              onToggleShare={handleToggleShare}
              shareButtonRef={shareButtonRef}
              sharePanelRef={sharePanelRef}
              shareUrl={shareUrl}
              onShareRoom={handleShareRoom}
              onOpenPartyScreen={handleOpenPartyScreen}
              onOpenCast={handleOpenCast}
              showCast={isCastInitialized}
              isCasting={isCasting}
              castDeviceName={castDeviceName}
              showSettings={showSettings}
              focusAdminLogin={focusAdminLogin}
              onToggleSettings={handleToggleSettings}
              onCloseSettings={handleCloseSettings}
              settingsButtonRef={settingsButtonRef}
              settingsMenuRef={settingsMenuRef}
              adminPassword={adminPassword}
              onAdminPasswordChange={setAdminPassword}
              onJoinAdmin={handleJoinAdmin}
              isAuthenticating={isAuthenticating}
              onLeave={handleLeave}
              providers={loaderData.providers}
            />
          )}

          <div
            key="room-content"
            className="min-h-0 min-w-0 flex-1 overflow-visible lg:overflow-hidden"
          >
            {showGenerationProgress && (
              <RoomGenerationProgress isFailed={false} />
            )}
            {!showGenerationProgress && (
              <>
                {generationError && (
                  <RoomGenerationProgress error={generationError} isFailed />
                )}
                <div
                  className={classNames(
                    'mx-auto w-full min-w-0 items-start gap-8 px-4 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-5 lg:grid-rows-[minmax(0,1fr)]',
                    !isPartyScreen && 'max-w-7xl py-8 lg:py-6',
                    isPartyScreen && 'max-w-none py-4 lg:p-6',
                  )}
                >
                  <RoomPlayer
                    roomId={id}
                    displayRoom={displayRoom}
                    onAddPlaylistItem={handleAddPlaylistItem}
                    onAddPlaylistItemIntent={() => prefetchPanel('add')}
                    onOpenCast={handleOpenCast}
                    initialPlayback={loaderData.playback}
                    providers={loaderData.providers}
                    {...playerPreloadProps}
                  />

                  {!isPartyScreen && (
                    <RoomQueue
                      chatOpen={chatOpen}
                      onChatVisibilityChange={setChatOpen}
                      onChatIntent={() => prefetchPanel('chat')}
                      roomId={id}
                      isSSR={isSSR}
                      onAddPlaylistItem={handleAddPlaylistItem}
                      isAdmin={isAdmin}
                      initialPlayback={loaderData.playback}
                      initialPlaylistItems={loaderData.playlistItems}
                      {...queuePreviewProps}
                    />
                  )}
                  {isPartyScreen && (
                    <div className="min-h-0 min-w-0 lg:col-span-2 lg:flex lg:h-full lg:flex-col">
                      <div className="min-h-0 lg:flex-1 lg:overflow-hidden">
                        <RoomQueue
                          chatOpen={chatOpen}
                          onChatVisibilityChange={setChatOpen}
                          onChatIntent={() => prefetchPanel('chat')}
                          roomId={id}
                          isSSR={isSSR}
                          onAddPlaylistItem={handleAddPlaylistItem}
                          isAdmin={isAdmin}
                          initialPlayback={loaderData.playback}
                          initialPlaylistItems={loaderData.playlistItems}
                          {...queuePreviewProps}
                        />
                      </div>
                      <Suspense
                        fallback={<div className="mt-5 h-52 shrink-0" />}
                      >
                        <LazyPartyScreenJoinCard
                          initialListenerCount={displayRoom.userCount ?? 0}
                          onExit={handleExitPartyScreen}
                          roomId={id}
                          roomName={displayRoom.name}
                          roomType={displayRoom.roomType}
                          url={shareUrl}
                        />
                      </Suspense>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </motion.div>
      <RoomOverlayPanels roomId={id} url={shareUrl} />
      <AnimatePresence>
        {showDeviceSelector && (
          <Suspense
            key="cast-modal"
            fallback={<DeferredModalLoading label="Loading cast devices..." />}
          >
            <LazyDeviceSelector
              isOpen={showDeviceSelector}
              onClose={handleCloseCast}
            />
          </Suspense>
        )}
        {isAddModalVisible && (
          <Suspense
            key="add-modal"
            fallback={<DeferredModalLoading label="Loading song search..." />}
          >
            <LazyAddToQueueModal
              room={displayRoom}
              providers={loaderData.providers}
              isVisible={isAddModalVisible}
              onClose={handleCloseAddPlaylistItem}
              onOpenAdminLogin={handleOpenAdminLogin}
              generationCount={displayRoom.generationCount}
              roomGenerationMaxDailyCount={
                displayRoom.roomGenerationMaxDailyCount
              }
              roomGenerationMaxExistingPlaylistItems={
                displayRoom.roomGenerationMaxExistingPlaylistItems
              }
              hasGenerationPermission={!displayRoom.hasPassword || isAdmin}
              isGenerating={isGenerating}
              onGenerationStarted={handleGenerationStarted}
            />
          </Suspense>
        )}
      </AnimatePresence>
      {!isAddModalVisible && !chatOpen && (
        <div className="sm:hidden">
          <Button
            aria-label={
              displayRoom.roomType === 'WATCH' ? 'Add video' : 'Add song'
            }
            className="fixed right-5 bottom-5 z-40 h-14 w-14 rounded-full p-0 shadow-primary-popover"
            onClick={handleAddPlaylistItem}
            onPointerEnter={() => prefetchPanel('add')}
            onFocus={() => prefetchPanel('add')}
            onTouchStart={() => prefetchPanel('add')}
            size="none"
            title={displayRoom.roomType === 'WATCH' ? 'Add video' : 'Add song'}
            variant="primary"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
}
