import {
  DendronError,
  DEngineClient,
  ERROR_SEVERITY,
  isNotUndefined,
  NoteProps,
  NoteUtils,
  StatusCodes,
  TAGS_HIERARCHY,
} from "@dendronhq/common-all";
import _ from "lodash";
import type { Image, Root } from "mdast";
import { paragraph } from "mdast-builder";
import {
  addError,
  getNoteOrError,
  hashTag2WikiLinkNoteV4,
  RemarkUtils,
  userTag2WikiLinkNoteV4,
} from "./remark/utils";
import Unified, { Processor, Transformer } from "unified";
import { Node } from "unist";
import u from "unist-builder";
import visitParents from "unist-util-visit-parents";
import { VFile } from "vfile";
import {
  BlockAnchor,
  DendronASTDest,
  DendronASTTypes,
  HashTag,
  NoteRefDataV4,
  RehypeLinkData,
  UserTag,
  VaultMissingBehavior,
  WikiLinkNoteV4,
  ExtendedImage,
} from "./types";
import { MDUtilsV4 } from "./utils";
import { MDUtilsV5, ProcFlavor, ProcMode } from "./utilsv5";
import { NoteRefsOpts } from "./remark/noteRefs";
import { UnistCommonUtils } from "./unistCommon";
import { DendronASTNode } from ".";
import { SiteUtils } from "../topics/site";

type PluginOpts = NoteRefsOpts & {
  assetsPrefix?: string;
  insertTitle?: boolean;
  /**
   * Don't publish pages that are dis-allowd by dendron.yml
   */
  transformNoPublish?: boolean;
  /** Don't display randomly generated colors for tags, only display color if it's explicitly set by the user. */
  noRandomlyColoredTags?: boolean;
};

const transformRehypeLink = (
  node: Node,
  data: { color?: string; href: string; alias: string }
) => {
  const { href, alias, color } = data;
  node.data = {
    alias,
    permalink: href,
    exists: true,
    hName: "a",
    hProperties: {
      className: color ? "color-tag" : undefined,
      style: color ? `--tag-color: ${color};` : undefined,
      href,
    },
    hChildren: [
      {
        type: "text",
        value: alias,
      },
    ],
  } as RehypeLinkData;
};

const transformRehypeLinkTo403 = (node: Node, { alias }: { alias: string }) => {
  node.data = {
    alias,
    hName: "a",
    hProperties: {
      title: "Private",
      style: "color: brown",
      href: "https://wiki.dendron.so/notes/hfyvYGJZQiUwQaaxQO27q.html",
      target: "_blank",
    },
    hChildren: [
      {
        type: "text",
        value: `${alias} (Private)`,
      },
    ],
  } as RehypeLinkData;
};

const wikilinkHandler = {
  match: (node: Node) => node.type === DendronASTTypes.WIKI_LINK,
  handle: (
    node: Node,
    opts: {
      proc: Processor;
      engine: DEngineClient;
    }
  ) => {
    const { proc, engine } = opts;

    const _node = node as WikiLinkNoteV4;
    let value = node.value as string;
    const data = _node.data;
    const vault = MDUtilsV4.getVault(proc, data.vaultName, {
      vaultMissingBehavior: VaultMissingBehavior.FALLBACK_TO_ORIGINAL_VAULT,
    });
    const procOpts = MDUtilsV5.getProcOpts(proc);
    const procData = MDUtilsV5.getProcData(proc);

    // pre-processing depending on mode
    switch (procOpts.mode) {
      case ProcMode.IMPORT: {
        throw Error("not handled");
      }
      default: {
        // TODO
      }
    }

    debugger;
    switch (procData.dest) {
      case DendronASTDest.HTML: {
        switch (procOpts.flavor) {
          case ProcFlavor.PUBLISHING: {
            // TODO: handle color for tags
            // if (mode !== ProcMode.IMPORT && value.startsWith(TAGS_HIERARCHY)) {
            const { fname, config } = procData;
            const { notes, wsRoot } = engine;
            const note = NoteUtils.getNoteByFnameV5({
              fname,
              notes,
              vault,
              wsRoot,
            });

            if (_.isUndefined(note)) {
              const code = StatusCodes.FORBIDDEN;
              value = _.toString(code);
              addError(
                proc,
                new DendronError({
                  message: "no note",
                  code,
                  severity: ERROR_SEVERITY.MINOR,
                })
              );
              return;
            }

            // return note
            const isPublished = SiteUtils.isPublished({
              note,
              config,
              engine,
            });
            const alias = data.alias ? data.alias : value;
            if (!isPublished) {
              value = _.toString(StatusCodes.FORBIDDEN);
              return transformRehypeLinkTo403(node, { alias });
            }

            const prefix = "/notes/";
            const usePrettyLinks = config.site.usePrettyLinks;
            const maybeFileExtension =
              _.isBoolean(usePrettyLinks) && usePrettyLinks ? "" : ".html";
            const href = `${config.site.assetsPrefix || ""}${
              prefix || ""
            }${value}${maybeFileExtension}${
              data.anchorHeader ? "#" + data.anchorHeader : ""
            }`;

            return transformRehypeLink(_node, {
              alias,
              href,
            });
          }
          default: {
            throw Error("NOT IMPLEMENTED - non PUBLISHING flavor");
          }
        }
      }
      default: {
        throw Error("NOT IMPLEMENTED - non HTML dest");
      }
    }
  },
};

function plugin(this: Unified.Processor, opts?: PluginOpts): Transformer {
  const proc = this;
  const { mode } = MDUtilsV5.getProcOpts(proc);
  const { dest, fname, config, insideNoteRef } = MDUtilsV5.getProcData(proc);

  // TODO
  const shouldInsertTitle = UnistCommonUtils.shouldInsertTitle(proc);

  function transformer(tree: Node, _file: VFile) {
    const root = tree as Root;
    const { engine, error: engineError } = MDUtilsV5.getProcEngine(proc);
    visitParents(tree, (node: Node, ancestors: Node[]) => {
      const parent = _.last(ancestors);
      if (_.isUndefined(parent) || !RemarkUtils.isParent(parent)) return; // root node

      // TODO: HASHTAG
      // TODO: USERTAG

      // --- WikiLink
      debugger;
      if (wikilinkHandler.match(node)) {
        return wikilinkHandler.handle(node, { engine, proc });
      }
    });

    return tree;
  }

  return transformer;
}

export { plugin as dendronPubRehype };
export { PluginOpts as DendronPubRehypeOpts };
