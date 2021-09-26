import { NoteTestUtilsV4 } from "@dendronhq/common-test-utils";
import Unified, { Plugin } from "unified";
import {
  dendronPub,
  wikiLinks,
  mdxShim,
  createDataPlugin,
  DendronASTDest,
  remark2rehype,
  dendronPubRehype,
  ProcMode,
  ProcFlavor,
} from "@dendronhq/engine-server";
import { render as rtlRender, waitFor } from "@testing-library/react";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import React from "react";
import { ENGINE_HOOKS, runEngineTestV5 } from "../../..";

// type MDXSource = ReturnType<typeof serialize>

function render(
  ui: any,
  { preloadedState, store, ...renderOptions } = {} as any
) {
  function Wrapper({ children }: { children: any }) {
    return <div data-testid="bond">{children}</div>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

async function createSerializer(opts: { source: string; dataPlugin: Plugin }) {
  const mdxSource = await serialize(opts.source, {
    mdxOptions: {
      remarkPlugins: [opts.dataPlugin, wikiLinks, dendronPubRehype],
      rehypePlugins: [],
    },
  });
  return mdxSource;
}

const renderMdx = async ({ mdxsource }: { mdxsource: any }) => {
  const { getByTestId } = render(<MDXRemote {...mdxsource} />);
  await waitFor(() => {
    const html = getByTestId("bond").innerHTML;
    expect(html).toMatchSnapshot();
    expect(getByTestId("bond").innerHTML).not.toEqual("{}");
  });
};

describe("GIVEN mdx", () => {
  describe("WHEN simple", () => {
    // test("THEN output simple text", async () => {
    //   await runEngineTestV5(
    //     async ({ engine }) => {
    //       const id = "foo";
    //       const notes = engine.notes;
    //       const note = notes[id];
    //       const mdxsource = await createSerializer(note.body);
    // 			await renderMdx({mdxsource})
    //     },
    //     {
    //       expect,
    //       preSetupHook: async (opts) => {
    //         await ENGINE_HOOKS.setupBasic(opts);
    //       },
    //     }
    //   );
    // });
  });

  describe.only("WHEN wikilink", () => {
    test("THEN output wikilink", async () => {
      await runEngineTestV5(
        async ({ engine }) => {
          const id = "foo";
          const notes = engine.notes;
          const note = notes[id];
          const dataPlugin = createDataPlugin({
            data: {
              dest: DendronASTDest.HTML,
              engine,
              fname: note.fname,
              vault: note.vault,
            },
            opts: {
              mode: ProcMode.FULL,
              flavor: ProcFlavor.PUBLISHING,
            },
          });
          const mdxsource = await createSerializer({
            source: note.body,
            dataPlugin,
          });
          await renderMdx({ mdxsource });
        },
        {
          expect,
          preSetupHook: async (opts) => {
            const { wsRoot, vaults } = opts;
            const vault = vaults[0];
            await ENGINE_HOOKS.setupBasic(opts);
            await NoteTestUtilsV4.modifyNoteByPath(
              { wsRoot, vault, fname: "foo" },
              (note) => {
                note.body = "[[foo]]";
                return note;
              }
            );
          },
        }
      );
    });
  });
});
