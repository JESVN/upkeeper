/**
 * Every user-visible string, keyed and in one module ([src/lib/README.md](README.md)).
 * A component imports a key; a key whose last call site is gone is deleted in
 * the same change. Chinese is the only shipped locale.
 */
export const copy = {
  app: {
    name: "Upkeep",
  },
  shell: {
    emptyTitle: "还没有可显示的状态",
    emptyHint: "窗口只渲染核心上次记录的 state.json；本机还没有扫描结果。",
  },
} as const;

export type Copy = typeof copy;
