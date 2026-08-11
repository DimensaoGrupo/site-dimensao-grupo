"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { uploadImage } from "@/lib/media/upload";
import { emptyDoc } from "@/lib/posts/contentTypes";

type RichTextEditorProps = {
  initialContentJson: string;
  onChange: (json: string) => void;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-primary text-white" : "text-foreground hover:bg-gray-light/50"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ initialContentJson, onChange }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: (() => {
      try {
        return JSON.parse(initialContentJson);
      } catch {
        return emptyDoc();
      }
    })(),
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[280px] rounded-b-xl border border-t-0 border-gray-light bg-white px-4 py-4 text-base leading-relaxed text-foreground outline-none " +
          "[&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground " +
          "[&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground " +
          "[&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-gray-medium " +
          "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_blockquote]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic " +
          "[&_img]:mt-3 [&_img]:w-full [&_img]:rounded-xl " +
          "[&_hr]:mt-6 [&_hr]:border-gray-light [&_a]:text-primary [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL do link (https://...)", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !editor) return;

      setUploading(true);
      setUploadError(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "content");

      const result = await uploadImage(formData);
      setUploading(false);

      if (result.error || !result.url) {
        setUploadError(result.error ?? "Não foi possível enviar a imagem.");
        return;
      }
      editor.chain().focus().setImage({ src: result.url }).run();
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-gray-light bg-[#f7f6f6] px-2 py-1.5">
        <ToolbarButton
          label="Título (H2)"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Subtítulo (H3)"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton
          label="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>N</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          Link
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton
          label="Lista com marcadores"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Lista
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Lista
        </ToolbarButton>
        <ToolbarButton
          label="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Citação
        </ToolbarButton>
        <ToolbarButton label="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-light" />
        <ToolbarButton
          label="Inserir imagem"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Enviando..." : "Imagem"}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
      </div>
      {uploadError && <p className="mt-2 text-sm text-primary">{uploadError}</p>}
      <EditorContent editor={editor} />
    </div>
  );
}
