// Shape of the stored Tiptap/ProseMirror document. Deliberately narrow —
// only the node/mark types actually enabled in the editor (see
// src/components/admin/RichTextEditor.tsx) are declared, and
// PostContent.tsx only ever renders these. Anything else in a stored
// document (e.g. a hand-crafted payload with a disallowed node type) is
// silently skipped rather than rendered — see PostContent.tsx.

export type MarkNode = {
  type: "bold" | "italic" | "link";
  attrs?: { href?: string };
};

export type ContentNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ContentNode[];
  text?: string;
  marks?: MarkNode[];
};

export type DocNode = {
  type: "doc";
  content: ContentNode[];
};

export function emptyDoc(): DocNode {
  return { type: "doc", content: [] };
}

export function parseContentJson(json: string): DocNode {
  try {
    const parsed = JSON.parse(json);
    if (parsed && parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed as DocNode;
    }
  } catch {
    // fall through
  }
  return emptyDoc();
}
