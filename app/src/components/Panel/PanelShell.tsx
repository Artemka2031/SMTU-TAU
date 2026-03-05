"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PanelShellProps {
  children: React.ReactNode;
}

const DESKTOP_BREAKPOINT = 1024;
const PANEL_WIDTH_DEFAULT = 420;
const PANEL_WIDTH_MIN = 320;
const PANEL_WIDTH_MAX = 560;
const COLLAPSED_HANDLE_WIDTH = 40;

const STORAGE_KEYS = {
  panelWidth: "tau.panel.desktop.width",
  desktopOpen: "tau.panel.desktop.open",
  mobileOpen: "tau.panel.mobile.open",
};

function clampPanelWidth(value: number) {
  return Math.max(PANEL_WIDTH_MIN, Math.min(PANEL_WIDTH_MAX, value));
}

function parseStoredBool(value: string | null, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function getInitialDesktopMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches;
}

function getInitialPanelWidth() {
  if (typeof window === "undefined") return PANEL_WIDTH_DEFAULT;
  const rawWidth = window.localStorage.getItem(STORAGE_KEYS.panelWidth);
  const nextWidth = Number.parseInt(rawWidth || "", 10);
  if (!Number.isFinite(nextWidth)) return PANEL_WIDTH_DEFAULT;
  return clampPanelWidth(nextWidth);
}

function getInitialBool(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  return parseStoredBool(window.localStorage.getItem(key), fallback);
}

const PanelShell: React.FC<PanelShellProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(getInitialDesktopMode);
  const [desktopOpen, setDesktopOpen] = useState(() =>
    getInitialBool(STORAGE_KEYS.desktopOpen, true)
  );
  const [mobileOpen, setMobileOpen] = useState(() =>
    getInitialBool(STORAGE_KEYS.mobileOpen, false)
  );
  const [panelWidth, setPanelWidth] = useState(getInitialPanelWidth);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(PANEL_WIDTH_DEFAULT);
  const mobileDialogRef = useRef<HTMLElement | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedRef = useRef<HTMLElement | null>(null);

  const desktopWidthStyle = useMemo(
    () => ({
      width: desktopOpen ? `${panelWidth}px` : `${COLLAPSED_HANDLE_WIDTH}px`,
    }),
    [desktopOpen, panelWidth]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const applyMedia = () => setIsDesktop(media.matches);

    applyMedia();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", applyMedia);
      return () => media.removeEventListener("change", applyMedia);
    }

    media.addListener(applyMedia);
    return () => media.removeListener(applyMedia);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.panelWidth, String(panelWidth));
  }, [panelWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.desktopOpen, String(desktopOpen));
  }, [desktopOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.mobileOpen, String(mobileOpen));
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen || isDesktop) return;

    previousFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    mobileCloseButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const dialog = mobileDialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusedRef.current?.focus();
    };
  }, [isDesktop, mobileOpen]);

  useEffect(() => {
    if (!isResizing) return;

    const prevUserSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onPointerMove = (event: PointerEvent) => {
      const delta = resizeStartXRef.current - event.clientX;
      setPanelWidth(clampPanelWidth(resizeStartWidthRef.current + delta));
    };

    const stopResize = () => {
      setIsResizing(false);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);

    return () => {
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = prevCursor;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };
  }, [isResizing]);

  const startResize = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDesktop || !desktopOpen) return;
      event.preventDefault();
      resizeStartXRef.current = event.clientX;
      resizeStartWidthRef.current = panelWidth;
      setIsResizing(true);
    },
    [desktopOpen, isDesktop, panelWidth]
  );

  const handleResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!desktopOpen) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPanelWidth((prev) => clampPanelWidth(prev + 16));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPanelWidth((prev) => clampPanelWidth(prev - 16));
      }
    },
    [desktopOpen]
  );

  if (isDesktop) {
    return (
      <aside
        className={cn(
          "relative h-full min-h-0 shrink-0 border-l bg-card transition-[width] duration-200 ease-out"
        )}
        style={desktopWidthStyle}
      >
        {desktopOpen && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину панели"
            tabIndex={0}
            className="absolute left-0 top-0 z-20 h-full w-2 -translate-x-1/2 cursor-col-resize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onPointerDown={startResize}
            onKeyDown={handleResizeKeyDown}
          >
            <div className="absolute left-1/2 top-1/2 h-14 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border" />
          </div>
        )}

        {desktopOpen ? (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDesktopOpen(false)}
              aria-label="Свернуть панель параметров"
              aria-expanded={desktopOpen}
              className="absolute right-2 top-2 z-20 h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="h-full min-h-0">{children}</div>
          </>
        ) : (
          <div className="flex h-full min-h-0 w-full flex-col items-center py-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDesktopOpen(true)}
              aria-label="Развернуть панель параметров"
              aria-expanded={desktopOpen}
              title="Развернуть панель"
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </aside>
    );
  }

  return (
    <>
      <Button
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        aria-label="Открыть панель параметров"
        className="absolute bottom-3 right-3 z-30 h-10 rounded-full px-4 shadow-lg"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Параметры
      </Button>

      <div
        className={cn(
          "absolute inset-0 z-40 bg-black/35 transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={mobileDialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Панель параметров"
        tabIndex={-1}
        className={cn(
          "absolute inset-x-0 bottom-0 z-50 h-[72%] min-h-[18rem] max-h-[32rem] overflow-hidden rounded-t-2xl border bg-card shadow-2xl transition-transform duration-200 ease-out",
          mobileOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <Button
          ref={mobileCloseButtonRef}
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(false)}
          aria-label="Закрыть панель параметров"
          className="absolute right-3 top-3 z-20 h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="h-full min-h-0">{children}</div>
      </aside>
    </>
  );
};

export default PanelShell;
