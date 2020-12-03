import { NoteUtilsV2 } from "@dendronhq/common-all";
import { NOTE_PRESETS_V4 } from "@dendronhq/common-test-utils";
import { describe } from "mocha";
// // You can import and use all API from the 'vscode' module
// // as well as import your extension to test it
import * as vscode from "vscode";
import { LookupCommand } from "../../commands/LookupCommand";
import { VSCodeUtils } from "../../utils";
import { getWS } from "../../workspace";
import { TIMEOUT } from "../testUtils";
import {
  expect,
  getNoteFromFname,
  getNoteFromTextEditor,
} from "../testUtilsv2";
import { runLegacyMultiWorkspaceTest, setupBeforeAfter } from "../testUtilsV3";

suite("Scratch Notes", function () {
  let ctx: vscode.ExtensionContext;
  this.timeout(TIMEOUT);

  ctx = setupBeforeAfter(this, {});

  describe("single", function () {
    test("basic", function (done) {
      runLegacyMultiWorkspaceTest({
        ctx,
        postSetupHook: async ({ wsRoot, vaults }) => {
          await NOTE_PRESETS_V4.NOTE_SIMPLE.create({
            vault: vaults[0],
            wsRoot,
          });
        },
        onInit: async ({ vaults }) => {
          const vault = vaults[0];
          const fname = NOTE_PRESETS_V4.NOTE_SIMPLE.fname;
          const notes = getWS().getEngine().notes;
          const note = NoteUtilsV2.getNoteByFnameV4({ fname, notes, vault });
          const editor = await VSCodeUtils.openNote(note!);
          const SIMPLE_SELECTION = new vscode.Selection(7, 0, 7, 12);
          editor.selection = SIMPLE_SELECTION;
          await new LookupCommand().execute({
            selectionType: "selection2link",
            noteType: "scratch",
            flavor: "note",
            noConfirm: true,
          });
          const scratchNote = getNoteFromTextEditor();
          expect(scratchNote.fname.startsWith("scratch")).toBeTruthy();
          done();
        },
      });
    });

    test("domainAsNamespace", function (done) {
      runLegacyMultiWorkspaceTest({
        ctx,
        configOverride: {
          "dendron.defaultScratchAddBehavior": "childOfDomainNamespace",
        },
        postSetupHook: async ({ wsRoot, vaults }) => {
          await NOTE_PRESETS_V4.NOTE_DOMAIN_NAMESPACE_CHILD.create({
            vault: vaults[0],
            wsRoot,
          });
        },
        onInit: async ({ vaults }) => {
          const vault = vaults[0];
          const {
            fname,
            selection,
          } = NOTE_PRESETS_V4.NOTE_DOMAIN_NAMESPACE_CHILD;
          const editor = await getNoteFromFname({ fname, vault });
          editor.selection = new vscode.Selection(...selection);
          await new LookupCommand().execute({
            selectionType: "selection2link",
            noteType: "scratch",
            flavor: "note",
            noConfirm: true,
          });
          const scratchNote = getNoteFromTextEditor();
          expect(scratchNote.fname.startsWith("pro.scratch")).toBeTruthy();
          done();
        },
      });
    });
  });

  describe("multi", function () {
    test("basic, multi", function (done) {
      runLegacyMultiWorkspaceTest({
        ctx,
        postSetupHook: async ({ wsRoot, vaults }) => {
          await NOTE_PRESETS_V4.NOTE_SIMPLE.create({
            vault: vaults[1],
            wsRoot,
          });
        },
        onInit: async ({ vaults }) => {
          const vault = vaults[1];
          const fname = NOTE_PRESETS_V4.NOTE_SIMPLE.fname;
          const notes = getWS().getEngine().notes;
          const note = NoteUtilsV2.getNoteByFnameV4({ fname, notes, vault });
          const editor = await VSCodeUtils.openNote(note!);
          const SIMPLE_SELECTION = new vscode.Selection(7, 0, 7, 12);
          editor.selection = SIMPLE_SELECTION;
          await new LookupCommand().execute({
            selectionType: "selection2link",
            noteType: "scratch",
            flavor: "note",
            noConfirm: true,
          });
          const scratchNote = getNoteFromTextEditor();
          expect(scratchNote.fname.startsWith("scratch")).toBeTruthy();
          done();
        },
      });
    });

    test.only("domainAsNamespace", function (done) {
      runLegacyMultiWorkspaceTest({
        ctx,
        configOverride: {
          "dendron.defaultScratchAddBehavior": "childOfDomainNamespace",
        },
        postSetupHook: async ({ wsRoot, vaults }) => {
          await NOTE_PRESETS_V4.NOTE_DOMAIN_NAMESPACE_CHILD.create({
            vault: vaults[1],
            wsRoot,
          });
        },
        onInit: async ({ vaults }) => {
          const vault = vaults[1];
          const {
            fname,
            selection,
          } = NOTE_PRESETS_V4.NOTE_DOMAIN_NAMESPACE_CHILD;
          const editor = await getNoteFromFname({ fname, vault });
          editor.selection = new vscode.Selection(...selection);
          await new LookupCommand().execute({
            selectionType: "selection2link",
            noteType: "scratch",
            flavor: "note",
            noConfirm: true,
          });
          const scratchNote = getNoteFromTextEditor();
          expect(scratchNote.fname.startsWith("pro.scratch")).toBeTruthy();
          done();
        },
      });
    });
  });
});
