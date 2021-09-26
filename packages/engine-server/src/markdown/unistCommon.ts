import { Processor } from "unified";
import { MDUtilsV5 } from ".";
import { DConfig } from "../config";

export class UnistCommonUtils {
  /**
   * Checks whether we should automatically add the FM title as the H1 Title
   * Disabled if inside a note reference
   * @param proc
   */
  static shouldInsertTitle = (proc: Processor) => {
    const { insideNoteRef, config } = MDUtilsV5.getProcData(proc);
    const shouldInsertTitle = insideNoteRef ? false : config.useFMTitle;

    if (!shouldInsertTitle) {
      // NOTE: currently our type definition has this as an optional property
      return DConfig.genDefaultConfig().useFMTitle!;
    } else {
      return shouldInsertTitle;
    }
  };
}
