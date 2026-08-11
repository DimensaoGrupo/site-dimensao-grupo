import type { ContentNode, MarkNode } from "@/lib/posts/contentTypes";
import { parseContentJson } from "@/lib/posts/contentTypes";

// Renders the sanitized, allow-listed subset of a Tiptap document as styled
// React elements — never `dangerouslySetInnerHTML`. This is what keeps
// "conteúdo" (o que o editor escolhe) separado de "design" (como cada bloco
// é estilizado): an author can only ever produce the node types handled
// below, and every one of them maps to a fixed, pre-styled element. This
// same component renders both the public article page and the admin
// preview, so what the admin sees before publishing is pixel-for-pixel what
// visitors see after.

const SAFE_HREF = /^(https?:|mailto:)/i;

function renderMarks(text: string, marks: MarkNode[] | undefined, key: string) {
  let node: React.ReactNode = text;

  for (const mark of marks ?? []) {
    if (mark.type === "bold") {
      node = <strong key={key}>{node}</strong>;
    } else if (mark.type === "italic") {
      node = <em key={key}>{node}</em>;
    } else if (mark.type === "link") {
      const href = mark.attrs?.href;
      if (typeof href === "string" && SAFE_HREF.test(href)) {
        node = (
          <a
            key={key}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:text-primary-dark"
          >
            {node}
          </a>
        );
      }
    }
  }

  return node;
}

function renderInline(nodes: ContentNode[] | undefined, keyPrefix: string) {
  if (!nodes) return null;
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;
    if (node.type === "text" && typeof node.text === "string") {
      return <span key={key}>{renderMarks(node.text, node.marks, key)}</span>;
    }
    if (node.type === "hardBreak") {
      return <br key={key} />;
    }
    return null;
  });
}

function renderBlocks(nodes: ContentNode[] | undefined, keyPrefix: string): React.ReactNode[] {
  if (!nodes) return [];

  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;

    switch (node.type) {
      case "paragraph":
        return (
          <p key={key} className="text-base leading-relaxed text-gray-medium md:text-lg">
            {renderInline(node.content, key)}
          </p>
        );

      case "heading": {
        const level = Number(node.attrs?.level) === 3 ? 3 : 2;
        const className =
          level === 2
            ? "mt-10 text-2xl font-bold text-foreground md:text-3xl"
            : "mt-8 text-xl font-bold text-foreground md:text-2xl";
        return level === 2 ? (
          <h2 key={key} className={className}>
            {renderInline(node.content, key)}
          </h2>
        ) : (
          <h3 key={key} className={className}>
            {renderInline(node.content, key)}
          </h3>
        );
      }

      case "bulletList":
        return (
          <ul key={key} className="list-disc space-y-2 pl-6 text-base leading-relaxed text-gray-medium md:text-lg">
            {node.content?.map((item, j) => (
              <li key={`${key}-${j}`}>{renderInline(item.content?.[0]?.content, `${key}-${j}`)}</li>
            ))}
          </ul>
        );

      case "orderedList":
        return (
          <ol key={key} className="list-decimal space-y-2 pl-6 text-base leading-relaxed text-gray-medium md:text-lg">
            {node.content?.map((item, j) => (
              <li key={`${key}-${j}`}>{renderInline(item.content?.[0]?.content, `${key}-${j}`)}</li>
            ))}
          </ol>
        );

      case "blockquote":
        return (
          <blockquote
            key={key}
            className="border-l-4 border-primary/40 pl-5 text-base leading-relaxed text-foreground/80 italic md:text-lg"
          >
            {node.content?.map((p, j) => <p key={`${key}-${j}`}>{renderInline(p.content, `${key}-${j}`)}</p>)}
          </blockquote>
        );

      case "horizontalRule":
        return <hr key={key} className="border-gray-light/70" />;

      case "image": {
        const src = node.attrs?.src;
        if (typeof src !== "string") return null;
        const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
        // Content images vary in aspect ratio and are already size-capped
        // and optimized to WebP by the upload pipeline
        // (src/lib/media/upload.ts), so a fixed-container next/image isn't
        // needed here.
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-2xl"
          />
        );
      }

      default:
        return null;
    }
  });
}

export default function PostContent({ contentJson }: { contentJson: string }) {
  const doc = parseContentJson(contentJson);

  return <div className="space-y-5">{renderBlocks(doc.content, "n")}</div>;
}
