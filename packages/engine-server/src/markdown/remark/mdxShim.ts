import { DendronError } from "@dendronhq/common-all";
import _ from "lodash";
import Unified, { Plugin } from "unified";
import { MDUtilsV5, ProcDataFullOptsV5, ProcOptsV5 } from "../utilsv5";

type PluginOpts = CompilerOpts;

type CompilerOpts = {};

const plugin: Plugin<[CompilerOpts?]> = function (this: Unified.Processor) {
  attachParser(this);
};
function attachParser(_proc: Unified.Processor) {}

export const createDataPlugin = (_opts: {
  data: ProcDataFullOptsV5;
  opts: ProcOptsV5;
}): Plugin<[CompilerOpts?]> => {
  const plugin: Plugin<[CompilerOpts?]> = function (this: Unified.Processor) {
    attachParser(this);
  };
  function attachParser(proc: Unified.Processor) {
    const errors: DendronError[] = [];

    MDUtilsV5.setProcOpts(proc, _opts.opts);
    MDUtilsV5.setProcData(proc, _opts.data);
    proc.data("errors", errors);
  }
  return plugin;
};

export { plugin as mdxShim };
export { PluginOpts as mdxShimOpts };
