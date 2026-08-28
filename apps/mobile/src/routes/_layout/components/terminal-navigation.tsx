import { classNames } from '@vibes/shared';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ZoffIcon, type ZoffIconName } from '@/components/zoff-icon';
import { useRoomNavigation } from '@/providers/app-provider';
import { useKonamiMode } from '@/providers/konami-mode-provider';

interface TerminalNavigationItem {
  href: '/' | '/remote' | '/settings';
  icon: ZoffIconName;
  label: string;
}

export function TerminalNavigation() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const { enabled } = useKonamiMode();
  const { canAddSongs, hasRoom } = useRoomNavigation();

  if (!enabled) return null;

  const items: TerminalNavigationItem[] = [
    { href: '/', icon: 'home', label: hasRoom ? 'ROOM' : 'ROOMS' },
    { href: '/remote', icon: 'remote', label: 'REMOTE' },
    { href: '/settings', icon: 'settings', label: 'CONFIG' },
  ];

  return (
    <View
      className="absolute inset-x-3 z-50 border border-[#55ffad] bg-[#010c08]/95 shadow-[#31ff9a]/20 shadow-lg"
      style={{ bottom: Math.max(insets.bottom, terminalNavigationInset) }}
    >
      <View className="flex-row border-[#71f5ad]/35 border-b bg-[#71f5ad]/5 px-3 py-1.5">
        <Text className="font-heading text-[#71f5ad]/70 text-[10px] uppercase tracking-widest">
          NAVIGATION BUS / CH 1989
        </Text>
      </View>
      <View className="flex-row p-1">
        {items.map((item) => {
          const selected = pathname === item.href;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={classNames(
                'min-h-14 min-w-0 flex-1 flex-row items-center justify-center gap-2 border border-transparent px-2 active:opacity-70',
                selected && 'border-[#55ffad] bg-[#71f5ad]',
              )}
              key={item.href}
              onPress={() => router.replace(item.href)}
            >
              <ZoffIcon
                color={selected ? '#03150d' : '#71f5ad'}
                name={item.icon}
                size={18}
              />
              <Text
                className={classNames(
                  'font-heading text-xs uppercase tracking-widest',
                  selected ? 'text-[#03150d]' : 'text-[#a6ffd0]/70',
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        {canAddSongs && (
          <Pressable
            accessibilityLabel="Add song"
            className="min-h-14 flex-row items-center justify-center gap-2 border border-[#55ffad] px-4 active:bg-[#71f5ad]/20"
            onPress={() => router.push('/add')}
          >
            <ZoffIcon color="#71f5ad" name="add" size={18} />
            <Text className="font-heading text-[#a6ffd0] text-xs uppercase tracking-widest">
              ADD
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const terminalNavigationInset = 8;
