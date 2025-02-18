import React, { Suspense, useMemo } from "react";
import { marked } from "marked";

import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => marked(children), [children]);

  return (
    <div
      className="space-y-3"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

interface HighlightedPreProps extends React.HTMLAttributes<HTMLPreElement> {
  children: string;
  language: string;
}

const HighlightedPre = React.memo(
  ({ children, language, ...props }: HighlightedPreProps) => {
    return <pre {...props}>{children}</pre>;
  }
);
HighlightedPre.displayName = "HighlightedCode";

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
  className?: string;
  language: string;
}

const CodeBlock = ({
  children,
  className,
  language,
  ...restProps
}: CodeBlockProps) => {
  const code =
    typeof children === "string" ? children : extractStringContents(children);

  const preClass = cn(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    className
  );

  return (
    <div className="group/code relative mb-4">
      <Suspense
        fallback={
          <pre className={preClass} {...restProps}>
            {children}
          </pre>
        }
      >
        <HighlightedPre language={language} className={preClass}>
          {code}
        </HighlightedPre>
      </Suspense>

      <div className="invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100">
        <CopyButton content={code} copyMessage="Copied code to clipboard" />
      </div>
    </div>
  );
};

function extractStringContents(element: React.ReactNode): string {
  if (typeof element === "string") {
    return element;
  }

  if (React.isValidElement(element) && element.props.children) {
    const children = element.props.children;

    if (Array.isArray(children)) {
      return children.map((child) => extractStringContents(child)).join("");
    } else {
      return extractStringContents(children);
    }
  }

  return "";
}

export default MarkdownRenderer;
