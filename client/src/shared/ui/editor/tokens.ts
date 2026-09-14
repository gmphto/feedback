/**
 * Editor design tokens.
 *
 * The editor is a dense, desktop-first operational surface. It gets its
 * hierarchy from pane boundaries, section rules and background changes rather
 * than large type, cards or elevation, so the raw values live here as named
 * constants instead of being scattered through components.
 *
 * These values intentionally do not depend on the MUI theme: the shell, panes
 * and the domain tables must stay visually identical across the light and dark
 * themes, because the workspace pane is always white and the chrome is always
 * dark.
 */

/** Fixed, non-interactive dark chrome. */
export const chrome = {
  /** Left navigation rail and global top bar. */
  base: '#223138',
  /** Secondary chrome: module navigation, pane headers, toolbars. */
  secondary: '#445157',
} as const;

/** Light workspace surfaces. */
export const surface = {
  /** Primary work surface. */
  workspace: '#FFFFFF',
  /** Subtle zebra/group surface inside the workspace. */
  subtle: '#F5F7F9',
  /** Alert/banner backgrounds. */
  warningTint: '#FFF7E6',
  errorTint: '#FFF1ED',
} as const;

export const border = {
  /** Standard 1px pane and row separator. */
  base: '#D8DDE0',
} as const;

export const text = {
  primary: '#24292D',
  /** Muted grey for labels and metadata. */
  secondary: '#667085',
  /** Disabled controls stay visible but lose contrast. */
  disabled: '#A7AFB6',
  /** Text on dark chrome. */
  onChrome: '#F5F7F9',
  onChromeMuted: 'rgba(245, 247, 249, 0.68)',
} as const;

/** Semantic accents. Used small and intentionally, never as large fills. */
export const accent = {
  /** Active module/tab, section underline, structural accent. */
  orange: '#E8791F',
  /** Success, valid/published state, selected/confirmed items. */
  green: '#3F7D0F',
  /** Warning banner. */
  amber: '#B54708',
  /** Destructive actions and invalid/problem state. */
  red: '#C0392B',
  /** Informational/domain markers. */
  blue: '#0B82F0',
} as const;

/** Density scale, in pixels. */
export const density = {
  pagePadding: 12,
  sectionGap: 18,
  fieldGapX: 20,
  fieldGapY: 10,
  rowHeight: 30,
  gridRowHeight: 28,
  inputHeight: 28,
  toolbarHeight: 34,
  navigationItemHeight: 40,
  controlRadius: 2,
  headerHeight: 44,
  moduleNavHeight: 40,
} as const;

/** Type scale. Very little variation; mostly 11–13px. */
export const typeScale = {
  screenTitle: 14,
  sectionTitle: 13,
  fieldLabel: 11,
  body: 12,
  meta: 11,
  nav: 12,
} as const;

export const fontFamily =
  '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';

/** One shared border style so panes, rows and toolbars stay consistent. */
export const hairline = `1px solid ${border.base}`;
