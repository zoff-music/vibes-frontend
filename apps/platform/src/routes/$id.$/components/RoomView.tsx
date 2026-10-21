import { classNames } from '@vibes/shared';
import { LinkButton, PersistentPlayerFrame, PlusIcon } from '@vibes/ui/web';
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
import type { RoomLoaderData } from '../loader';
import { loadAddToQueueModal } from '../utils/preloadQueueModal';
import { RoomOverlayPanels } from './RoomOverlayPanels';
import { UserCount } from './UserCount';

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

interface RoomViewProps {
  loaderData: RoomLoaderData;
  minimized: boolean;
  onClose: () => void;
}

export function RoomView({
  loaderData: initialData,
  minimized,
  onClose,
}: RoomViewProps) {
  const {
    loaderData,
    panelHref,
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
    handleCloseAddPlaylistItem,
    handleCloseCast,
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
  } = useRoomView(initialData, minimized);

  return (
    <PersistentPlayerFrame
      minimized={minimized}
      roomName={displayRoom.name}
      roomHref={`/${encodeURIComponent(id)}`}
      onClose={onClose}
    >
      <RoomConnections providers={loaderData.providers} />
      <motion.div
        animate={roomEntryVisibleState}
        className={classNames(
          'room-entry relative min-h-dvh w-full min-w-0 overflow-x-hidden lg:h-dvh lg:min-h-0 lg:overflow-hidden',
          isPartyScreen && 'bg-theme',
          minimized && '!min-h-0 !h-auto !overflow-visible',
        )}
        initial={roomEntryInitial}
        transition={roomEntryTransition}
      >
        <section
          role={minimized ? 'region' : 'main'}
          aria-label={`Room ${displayRoom.name}`}
          className={classNames(
            'relative z-10 flex min-h-dvh w-full min-w-0 flex-col overflow-x-hidden lg:h-dvh lg:min-h-0 lg:overflow-hidden',
            chatOpen && !isPartyScreen && 'h-dvh',
            minimized && '!min-h-0 !h-auto',
          )}
        >
          {!isPartyScreen && !minimized && (
            <RoomHeader
              adminError={adminError}
              key="room-header"
              headerRef={headerRef}
              displayRoom={displayRoom}
              roomId={id}
              showShare={showShare}
              shareButtonRef={shareButtonRef}
              sharePanelRef={sharePanelRef}
              shareUrl={shareUrl}
              onShareRoom={handleShareRoom}
              onOpenPartyScreen={handleOpenPartyScreen}
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
                    !isPartyScreen && 'max-w-7xl pt-4 pb-8 sm:pt-3 lg:pb-6',
                    chatOpen &&
                      !isPartyScreen &&
                      'max-lg:flex max-lg:h-full max-lg:flex-col max-lg:items-stretch max-lg:gap-0',
                    isPartyScreen && 'max-w-none py-4 lg:p-6',
                    minimized && '!block !p-0',
                  )}
                >
                  <RoomPlayer
                    minimized={minimized}
                    roomId={id}
                    displayRoom={displayRoom}
                    addPlaylistItemHref={panelHref('add')}
                    castHref={panelHref('cast')}
                    initialPlayback={loaderData.playback}
                    providers={loaderData.providers}
                    {...playerPreloadProps}
                  />

                  {!isPartyScreen && !minimized && (
                    <div
                      className={classNames(
                        'min-h-0 min-w-0 lg:col-span-2 lg:h-full',
                        chatOpen && 'flex min-h-80 flex-1 flex-col lg:min-h-0',
                      )}
                    >
                      <RoomQueue
                        key={id}
                        listenerCount={
                          <UserCount
                            initialCount={displayRoom.userCount ?? 0}
                            roomId={id}
                            roomType={displayRoom.roomType}
                          />
                        }
                        chatOpen={chatOpen}
                        roomId={id}
                        isSSR={isSSR}
                        addPlaylistItemHref={panelHref('add')}
                        isAdmin={isAdmin}
                        initialPlayback={loaderData.playback}
                        initialPlaylistItems={loaderData.playlistItems}
                        {...queuePreviewProps}
                      />
                    </div>
                  )}
                  {isPartyScreen && (
                    <div className="min-h-0 min-w-0 lg:col-span-2 lg:flex lg:h-full lg:flex-col">
                      <div className="min-h-0 lg:flex-1 lg:overflow-hidden">
                        <RoomQueue
                          key={id}
                          listenerCount={
                            <UserCount
                              initialCount={displayRoom.userCount ?? 0}
                              roomId={id}
                              roomType={displayRoom.roomType}
                            />
                          }
                          chatOpen={chatOpen}
                          roomId={id}
                          isSSR={isSSR}
                          addPlaylistItemHref={panelHref('add')}
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
                          onExit={handleExitPartyScreen}
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
        </section>
      </motion.div>
      {!minimized && <RoomOverlayPanels roomId={id} url={shareUrl} />}
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
      {!minimized && !isAddModalVisible && !chatOpen && (
        <div className="sm:hidden">
          <LinkButton
            aria-label={
              displayRoom.roomType === 'WATCH' ? 'Add video' : 'Add song'
            }
            className="fixed right-5 bottom-5 z-40 h-14 w-14 p-0 shadow-primary-popover"
            to={panelHref('add')}
            replace
            preventScrollReset
            viewTransition={false}
            prefetch="intent"
            prefetchData
            size="none"
            title={displayRoom.roomType === 'WATCH' ? 'Add video' : 'Add song'}
            variant="primary"
          >
            <PlusIcon className="h-6 w-6" />
          </LinkButton>
        </div>
      )}
    </PersistentPlayerFrame>
  );
}
