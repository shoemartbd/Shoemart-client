"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AnyFieldApi } from "@tanstack/react-form";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect } from "react";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return String(error);
};

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    // Prevent the editor from losing text selection before the command runs.
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={cn(
      "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
      active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
    )}
  >
    {children}
  </button>
);

function useRichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { class: "text-primary underline underline-offset-2" },
        },
      }),
      Placeholder.configure({ placeholder: placeholder || "Write something…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
    onBlur: () => onBlur?.(),
  });

  // Keep the editor in sync when the value changes from outside
  // (e.g. form.reset() on edit, or the AI-generate button).
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  return editor;
}

function RichTextEditorShell({
  editor,
  label,
  htmlFor,
  error,
  minHeight,
  className,
}: {
  editor: Editor | null;
  label?: string;
  htmlFor: string;
  error?: string | null;
  minHeight: string;
  className?: string;
}) {
  const hasError = !!error;

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} className={cn(hasError && "text-destructive")}>
          {label}
        </Label>
      )}

      <div
        className={cn(
          "overflow-hidden rounded-md border border-input bg-background/50 shadow-xs transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
          hasError && "border-destructive focus-within:ring-destructive/20",
        )}
      >
        {editor && (
          <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 px-2 py-1">
            <ToolbarButton
              title="Bold"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Italic"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Underline"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Strikethrough"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="size-3.5" />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-border" />

            <ToolbarButton
              title="Heading"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Bullet list"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Numbered list"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Quote"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="size-3.5" />
            </ToolbarButton>

            <div className="mx-1 h-4 w-px bg-border" />

            <ToolbarButton title="Add link" active={editor.isActive("link")} onClick={setLink}>
              <Link2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Remove link"
              disabled={!editor.isActive("link")}
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              <Link2Off className="size-3.5" />
            </ToolbarButton>

            <div className="flex-1" />

            <ToolbarButton
              title="Undo"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Redo"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 className="size-3.5" />
            </ToolbarButton>
          </div>
        )}

        <div
          style={{ ["--rte-min-h" as string]: minHeight }}
          onClick={() => editor?.chain().focus().run()}
          className="cursor-text px-3 py-2 text-sm [&_.tiptap]:min-h-[var(--rte-min-h)]"
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {hasError && (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

type RichTextEditorProps = {
  field: AnyFieldApi;
  label?: string;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Drop-in Tiptap rich text field styled to match AppField.
 * Stores/emits content as an HTML string via field.handleChange.
 */
export default function RichTextEditor({
  field,
  label,
  placeholder,
  className,
  minHeight = "160px",
}: RichTextEditorProps) {
  const firstError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0
      ? getErrorMessage(field.state.meta.errors[0])
      : null;

  const editor = useRichTextEditor({
    value: field.state.value || "",
    onChange: field.handleChange,
    onBlur: field.handleBlur,
    placeholder,
  });

  return (
    <RichTextEditorShell
      editor={editor}
      label={label}
      htmlFor={field.name}
      error={firstError}
      minHeight={minHeight}
      className={className}
    />
  );
}

type SimpleRichTextEditorProps = {
  id: string;
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  minHeight?: string;
};

/**
 * Same Tiptap editor as RichTextEditor, but for plain useState-based forms
 * (no @tanstack/react-form field required) — takes value/onChange directly.
 */
export function SimpleRichTextEditor({
  id,
  value,
  onChange,
  label,
  placeholder,
  className,
  minHeight = "160px",
}: SimpleRichTextEditorProps) {
  const editor = useRichTextEditor({ value, onChange, placeholder });

  return (
    <RichTextEditorShell
      editor={editor}
      label={label}
      htmlFor={id}
      minHeight={minHeight}
      className={className}
    />
  );
}
