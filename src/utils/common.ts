// Путь внутри игры: /:gameId или /:gameId/<под-путь>. Все экраны игры адресуются
// через него, чтобы префикс gameId не размазывался по компонентам строками.
export function gamePath(gameId: string, sub = ""): string {
  return sub ? `/${gameId}/${sub}` : `/${gameId}`;
}
