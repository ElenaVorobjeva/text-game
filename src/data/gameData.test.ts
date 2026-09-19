import { describe, expect, test } from "vitest";

import { gameList } from "./games";

// Тесты на целостность контента, а не на код: ловят опечатки в данных игры
// (несуществующие сцены, битые картинки, тупики) до того, как игрок упрётся.
// Прогоняются по КАЖДОЙ игре из реестра — новые игры получают ту же проверку.

// Файлы из public/ — по ним проверяется, что картинки из данных существуют.
// Импорт не выполняется, нужны только ключи (пути).
const publicFiles = new Set(
  Object.keys(import.meta.glob("/public/images/**/*")).map((path) =>
    path.replace("/public", ""),
  ),
);

for (const game of gameList) {
  describe(`content integrity: ${game.meta.id}`, () => {
    const { chapters, meta, scenes } = game;

    const sceneIds = new Set(scenes.map((scene) => scene.id));
    const chapterIds = new Set(chapters.map((chapter) => chapter.id));

    describe("scene links", () => {
      test("every choice points at a scene that exists", () => {
        const broken = scenes.flatMap((scene) =>
          scene.choices
            .filter((choice) => !sceneIds.has(choice.nextSceneId))
            .map((choice) => `${scene.id} → ${choice.nextSceneId}`),
        );

        expect(broken).toEqual([]);
      });

      test("the starting scene from meta exists", () => {
        expect(sceneIds.has(meta.startSceneId)).toBe(true);
      });

      test("every chapter points at a starting scene that exists", () => {
        const broken = chapters
          .filter((chapter) => !sceneIds.has(chapter.startScene))
          .map((chapter) => `${chapter.id} → ${chapter.startScene}`);

        expect(broken).toEqual([]);
      });

      test("every scene is reachable from the start", () => {
        const reachable = new Set<string>();
        const queue = [
          meta.startSceneId,
          ...chapters.map((chapter) => chapter.startScene),
        ];

        while (queue.length > 0) {
          const id = queue.pop();
          if (!id || reachable.has(id)) continue;

          reachable.add(id);

          const scene = scenes.find((item) => item.id === id);
          scene?.choices.forEach((choice) => queue.push(choice.nextSceneId));
        }

        const orphans = [...sceneIds].filter((id) => !reachable.has(id));

        expect(orphans).toEqual([]);
      });
    });

    describe("identifiers", () => {
      test("scene ids are unique", () => {
        expect(scenes).toHaveLength(sceneIds.size);
      });

      test("choice ids are unique across the whole game", () => {
        const choiceIds = scenes.flatMap((scene) =>
          scene.choices.map((choice) => choice.id),
        );

        expect(choiceIds).toHaveLength(new Set(choiceIds).size);
      });

      test("every scene belongs to an existing chapter or to the endings", () => {
        const orphans = scenes
          .filter(
            (scene) => scene.chapter !== 0 && !chapterIds.has(scene.chapter),
          )
          .map((scene) => `${scene.id}: chapter ${scene.chapter}`);

        expect(orphans).toEqual([]);
      });
    });

    describe("playability", () => {
      test("every non-ending scene offers at least one choice", () => {
        const stuck = scenes
          .filter((scene) => !scene.isEnding && scene.choices.length === 0)
          .map((scene) => scene.id);

        expect(stuck).toEqual([]);
      });

      test("every non-ending scene has a choice with no conditions", () => {
        // Иначе игрок с «неудачными» характеристиками застрянет:
        // все варианты окажутся скрыты и пройти сцену будет нечем.
        const stuck = scenes
          .filter(
            (scene) =>
              !scene.isEnding &&
              !scene.choices.some(
                (choice) =>
                  !choice.conditions || choice.conditions.length === 0,
              ),
          )
          .map((scene) => scene.id);

        expect(stuck).toEqual([]);
      });
    });

    describe("endings", () => {
      const endings = scenes.filter((scene) => scene.isEnding);

      test("the game has ending scenes", () => {
        expect(endings.length).toBeGreaterThan(0);
      });

      test("every ending declares its type", () => {
        const untyped = endings
          .filter((scene) => !scene.endingType)
          .map((scene) => scene.id);

        expect(untyped).toEqual([]);
      });

      test("endings have no choices", () => {
        const withChoices = endings
          .filter((scene) => scene.choices.length > 0)
          .map((scene) => scene.id);

        expect(withChoices).toEqual([]);
      });

      test("ending types are unique", () => {
        const types = endings.map((scene) => scene.endingType);

        expect(types).toHaveLength(new Set(types).size);
      });
    });

    describe("images", () => {
      // Путь /public/images/… работает в dev и отдаёт 404 в проде:
      // public/ копируется в корень dist/, а не остаётся отдельной папкой.
      function isPublicPath(path: string) {
        return path.startsWith("/images/");
      }

      test("the cover points at /images/", () => {
        expect(isPublicPath(meta.cover)).toBe(true);
      });

      test("chapter images point at /images/", () => {
        const broken = chapters
          .filter((chapter) => !isPublicPath(chapter.image))
          .map((chapter) => `${chapter.id}: ${chapter.image}`);

        expect(broken).toEqual([]);
      });

      test("scene images point at /images/", () => {
        const broken = scenes
          .filter((scene) => scene.image && !isPublicPath(scene.image))
          .map((scene) => `${scene.id}: ${scene.image}`);

        expect(broken).toEqual([]);
      });

      // Картинки лежат в public/: переименование или смена формата файла без
      // правки данных даёт 404 только в браузере.
      test("every referenced image file exists in public/", () => {
        const paths = [
          meta.cover,
          ...chapters.map((chapter) => chapter.image),
          ...scenes.flatMap((scene) => (scene.image ? [scene.image] : [])),
        ];

        const missing = paths.filter((path) => !publicFiles.has(path));

        expect(missing).toEqual([]);
      });

      test("every ending has its own picture", () => {
        const missing = scenes
          .filter((scene) => scene.isEnding && !scene.image)
          .map((scene) => scene.id);

        expect(missing).toEqual([]);
      });
    });
  });
}
