import type { PropsWithChildren, ReactNode } from 'react';
import { Text, View } from 'react-native';

interface NativeTerminalShellProps extends PropsWithChildren {
  channel: string;
  footer?: ReactNode;
  title: string;
}

export function NativeTerminalShell({
  channel,
  children,
  footer,
  title,
}: NativeTerminalShellProps) {
  return (
    <View className="border border-[#55ffad] bg-[#010c08]/95 shadow-2xl shadow-[#31ff9a]/15">
      <View className="min-h-11 flex-row items-center justify-between gap-3 bg-[#71f5ad] px-4 py-2.5">
        <Text className="font-heading text-[#03150d] text-sm uppercase">
          ZOFF BIOS v19.89
        </Text>
        <Text className="font-heading text-[#03150d] text-sm uppercase">
          [ {channel} ]
        </Text>
      </View>
      <View className="border-[#71f5ad]/35 border-b px-4 py-2">
        <Text className="font-heading text-[#a6ffd0]/70 text-xs uppercase tracking-widest">
          CH 1989 / {title} / LINK SECURE
        </Text>
      </View>
      <View className="gap-4 p-4">{children}</View>
      <View className="min-h-9 flex-row items-center justify-between gap-3 border-[#71f5ad]/35 border-t px-4 py-2">
        {footer ?? (
          <>
            <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
              SIGNAL LOCKED
            </Text>
            <Text className="font-heading text-[#a6ffd0]/65 text-xs uppercase tracking-widest">
              音楽は共有するもの
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

interface NativeTerminalToolbarProps {
  description: string;
  title: string;
}

export function NativeTerminalToolbar({
  description,
  title,
}: NativeTerminalToolbarProps) {
  return (
    <View className="gap-3 border-[#71f5ad]/25 border-b pb-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="font-heading text-[#e0ffef] text-xl uppercase tracking-widest">
            {title}
          </Text>
          <Text className="font-heading text-[#a6ffd0]/55 text-xs uppercase tracking-widest">
            {description}
          </Text>
        </View>
        <TerminalBadge label="ONLINE" />
      </View>
      <View className="flex-row gap-2">
        <TerminalRegister label="INTERFACE" value="NATIVE" />
        <TerminalRegister label="MODE" value="TERMINAL" />
        <TerminalRegister label="LINK" value="SECURE" />
      </View>
    </View>
  );
}

interface NativeTerminalSectionProps extends PropsWithChildren {
  label: string;
  status?: string;
}

export function NativeTerminalSection({
  children,
  label,
  status = 'READY',
}: NativeTerminalSectionProps) {
  return (
    <View className="gap-0">
      <View className="flex-row items-center justify-between border-[#71f5ad]/35 border-x border-t bg-[#71f5ad]/5 px-3 py-2">
        <Text className="font-heading text-[#71f5ad] text-xs uppercase tracking-widest">
          {label}
        </Text>
        <Text className="font-heading text-[#a6ffd0]/60 text-xs uppercase tracking-widest">
          {status}
        </Text>
      </View>
      {children}
    </View>
  );
}

function TerminalBadge({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-2 border border-[#55ffad] bg-[#71f5ad]/10 px-2.5 py-2">
      <View className="size-2 bg-[#71f5ad]" />
      <Text className="font-heading text-[#dffff0] text-xs uppercase tracking-widest">
        {label}
      </Text>
    </View>
  );
}

function TerminalRegister({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1 border border-[#71f5ad]/25 bg-black/20 px-2 py-2">
      <Text className="font-heading text-[#71f5ad]/50 text-[10px] uppercase tracking-widest">
        {label}
      </Text>
      <Text className="mt-1 font-heading text-[#dffff0] text-xs uppercase">
        {value}
      </Text>
    </View>
  );
}
