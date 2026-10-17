import {
  useFetcher,
  useLoaderData,
  useSearchParams,
} from '@kasperrt/smolter/preact';
import {
  isSourceType,
  type RoomNameReservation,
  type SourceType,
} from '@vibes/models';
import {
  DEFAULT_ROOM_SETTINGS,
  showRateLimitMessageToast,
} from '@vibes/shared';
import { useThemeStore } from '@vibes/shared/themeStore';
import React, { useEffect, useState } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import { type RoomsCreateActionData } from '../clientAction';
import type { clientLoader } from '../clientLoader';
import { slugifyRoomName } from '../utils/slugifyRoomName';

type RoomNameAvailabilityState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

export function useCreateRoom() {
  const loaderData = useLoaderData<typeof clientLoader>();
  const createFetcher = useFetcher<RoomsCreateActionData>();
  const suggestionFetcher = useFetcher<RoomsCreateActionData>();
  const availabilityFetcher = useFetcher<RoomsCreateActionData>();
  const [searchParams] = useSearchParams();
  const roomType = useExperience();
  const setIsWarping = useThemeStore((state) => state.setIsWarping);
  const initialName =
    loaderData.createRoomName ?? searchParams.get('name') ?? '';
  const [name, setName] = useState(initialName);
  const [mode, setMode] = useState<'server' | 'host'>('server');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);
  const [error, setError] = useState<string | null>(loaderData.error ?? null);
  const [nameAvailability, setNameAvailability] =
    useState<RoomNameAvailabilityState>('idle');
  const [nameAvailabilityError, setNameAvailabilityError] = useState<
    string | null
  >(null);
  const [reservation, setReservation] = useState<RoomNameReservation | null>(
    null,
  );
  const [isWaitingToCreate, setIsWaitingToCreate] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [wobblePassword, setWobblePassword] = useState(false);
  const createFormRef = React.useRef<HTMLFormElement>(null);
  const passwordRef = React.useRef<HTMLDivElement>(null);
  const availabilityTimerRef = React.useRef<number | null>(null);
  const pendingCreationNameRef = React.useRef('');
  const reservationTokenRef = React.useRef('');
  const availabilityFetcherSubmitRef = React.useRef(availabilityFetcher.submit);

  React.useLayoutEffect(() => {
    reservationTokenRef.current = reservation?.token ?? '';
    availabilityFetcherSubmitRef.current = availabilityFetcher.submit;
  }, [reservation?.token, availabilityFetcher.submit]);

  const checkRoomNameAvailability = React.useCallback((roomName: string) => {
    setNameAvailability('checking');
    setNameAvailabilityError(null);

    void availabilityFetcherSubmitRef.current(
      {
        intent: 'reserveRoomName',
        name: roomName,
      },
      {
        method: 'post',
        action: '/rooms/create',
      },
    );
  }, []);

  useEffect(() => {
    if (wobblePassword) {
      const timer = setTimeout(() => setWobblePassword(false), 500);

      return () => clearTimeout(timer);
    }
  }, [wobblePassword]);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    if (availabilityTimerRef.current !== null) {
      window.clearTimeout(availabilityTimerRef.current);
      availabilityTimerRef.current = null;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      pendingCreationNameRef.current = '';
      setIsWaitingToCreate(false);
      setReservation(null);
      setNameAvailability('idle');
      setNameAvailabilityError(null);

      return;
    }

    if (
      reservation &&
      reservation.name === slugifyRoomName(trimmedName) &&
      Date.parse(reservation.expiresAt) > Date.now()
    ) {
      setNameAvailability('available');
      setNameAvailabilityError(null);

      return;
    }

    setNameAvailability('checking');
    setNameAvailabilityError(null);
    availabilityTimerRef.current = window.setTimeout(() => {
      availabilityTimerRef.current = null;
      void checkRoomNameAvailability(trimmedName);
    }, 500);

    return () => {
      if (availabilityTimerRef.current !== null) {
        window.clearTimeout(availabilityTimerRef.current);
        availabilityTimerRef.current = null;
      }
    };
  }, [name, reservation, checkRoomNameAvailability]);

  useEffect(() => {
    if (!reservation) return;

    const expiresIn = Date.parse(reservation.expiresAt) - Date.now();

    if (expiresIn <= 0) {
      setReservation(null);

      return;
    }

    const timer = window.setTimeout(() => {
      setReservation(null);
    }, expiresIn);

    return () => window.clearTimeout(timer);
  }, [reservation]);

  useEffect(() => {
    const data = availabilityFetcher.data;

    if (!data || data.checkedName !== name.trim()) return;

    if (data.rateLimitMessage) {
      showRateLimitMessageToast(data.rateLimitMessage);
    }

    if (data.error) {
      setReservation(null);

      if (data.roomNameUnavailable) {
        setNameAvailability('taken');
      } else {
        setNameAvailability('error');
      }

      setNameAvailabilityError(data.error);

      if (pendingCreationNameRef.current === data.checkedName) {
        pendingCreationNameRef.current = '';
        setIsWaitingToCreate(false);
        setError(data.error);
      }

      return;
    }

    if (!data.reservation) return;

    setReservation(data.reservation);
    setNameAvailability('available');
    setNameAvailabilityError(null);

    if (pendingCreationNameRef.current === data.checkedName) {
      pendingCreationNameRef.current = '';
      setIsWaitingToCreate(false);
      setIsReadyToSubmit(true);
    }
  }, [availabilityFetcher.data, name]);

  useEffect(() => {
    if (!isReadyToSubmit || !reservation) return;

    setIsReadyToSubmit(false);
    createFormRef.current?.requestSubmit();
  }, [isReadyToSubmit, reservation]);

  useEffect(() => {
    const data = suggestionFetcher.data;

    if (!data) return;

    if (data.rateLimitMessage) {
      showRateLimitMessageToast(data.rateLimitMessage);
    }

    if (data.error) {
      setError(data.error);

      return;
    }

    if (!data.reservation) return;

    setReservation(data.reservation);
    setNameAvailability('available');
    setNameAvailabilityError(null);
    setName(data.reservation.name);
  }, [suggestionFetcher.data]);

  const isLoading = createFetcher.state !== 'idle';
  const isCreating = isLoading || isWaitingToCreate;
  const isGeneratingName = suggestionFetcher.state !== 'idle';
  const handleGenerateName = () => {
    if (isGeneratingName || isLoading) return;

    setError(null);
    void suggestionFetcher.submit(
      {
        intent: 'reserveRoomName',
      },
      {
        method: 'post',
        action: '/rooms/create',
      },
    );
  };
  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      event.preventDefault();
      setError('Enter a room name before starting the session.');

      return;
    }

    if (isCreating) {
      event.preventDefault();

      return;
    }

    if (nameAvailability === 'taken') {
      event.preventDefault();
      setError('That room name is already in use. Choose another name.');

      return;
    }

    if (nameAvailability === 'available' && reservationTokenRef.current) {
      setIsWarping(true);
      setError(null);

      return;
    }

    event.preventDefault();

    if (availabilityTimerRef.current !== null) {
      window.clearTimeout(availabilityTimerRef.current);
      availabilityTimerRef.current = null;
    }

    pendingCreationNameRef.current = trimmedName;
    setIsWaitingToCreate(true);
    setError(null);
    checkRoomNameAvailability(trimmedName);
  };

  useEffect(() => {
    if (!createFetcher.data) return;

    if (createFetcher.data.rateLimitMessage) {
      showRateLimitMessageToast(createFetcher.data.rateLimitMessage);
      setError(null);
      setIsWarping(false);

      return;
    }

    if (createFetcher.data.error) {
      setError(createFetcher.data.error);
      setIsWarping(false);
    }
  }, [createFetcher.data, setIsWarping]);

  useEffect(() => {
    return () => setIsWarping(false);
  }, [setIsWarping]);

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const toggleSource = (source: SourceType) => {
    if (!loaderData.providers?.includes(source)) {
      return;
    }

    const enabledSources = settings.enabledSources.includes(source)
      ? settings.enabledSources.filter(
          (enabledSource) => enabledSource !== source,
        )
      : [...settings.enabledSources, source];
    updateSetting('enabledSources', enabledSources);
  };
  const handleSourceToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const source = event.currentTarget.value;

    if (!isSourceType(source)) {
      return;
    }

    toggleSource(source);
  };
  const updatePassword = (nextPassword: string) => {
    setPassword(nextPassword);

    if (nextPassword) {
      return;
    }

    setSettings((currentSettings) => ({
      ...currentSettings,
      onlyAdminAddPlaylistItems: false,
      public: false,
    }));
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePassword(event.currentTarget.value);
  };
  const handlePublicRoomChange = (checked: boolean) => {
    if (!password) {
      return;
    }

    updateSetting('public', checked);
  };
  const publicRoomDescription = password
    ? 'Let anyone find this room in Browse'
    : 'Add an admin password to make this room public';

  return {
    loaderData,
    createFetcher,
    roomType,
    name,
    setName,
    mode,
    setMode,
    password,
    settings,
    error,
    nameAvailability,
    nameAvailabilityError,
    reservation,
    isWaitingToCreate,
    wobblePassword,
    setWobblePassword,
    createFormRef,
    passwordRef,
    isLoading,
    isCreating,
    isGeneratingName,
    handleGenerateName,
    handleCreate,
    updateSetting,
    handleSourceToggle,
    handlePasswordChange,
    handlePublicRoomChange,
    publicRoomDescription,
  };
}
