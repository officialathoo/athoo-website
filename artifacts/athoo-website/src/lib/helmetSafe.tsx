import React, { useEffect } from "react";

type HelmetProps = { children?: React.ReactNode };

function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  return "";
}

export function HelmetProvider({ children }: HelmetProps) {
  return <>{children}</>;
}

export function Helmet({ children }: HelmetProps) {
  useEffect(() => {
    React.Children.forEach(children, (child: any) => {
      if (!React.isValidElement(child)) return;
      const type = child.type;
      const props: any = child.props || {};
      if (type === "title") {
        const title = textOf(props.children);
        if (title) document.title = title;
        return;
      }
      if (type === "meta") {
        const key = props.name ? `meta[name="${props.name}"]` : props.property ? `meta[property="${props.property}"]` : "";
        if (!key) return;
        let el = document.head.querySelector(key) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement("meta");
          if (props.name) el.setAttribute("name", props.name);
          if (props.property) el.setAttribute("property", props.property);
          document.head.appendChild(el);
        }
        if (props.content !== undefined) el.setAttribute("content", String(props.content));
        return;
      }
      if (type === "link") {
        const rel = props.rel ? String(props.rel) : "";
        const href = props.href ? String(props.href) : "";
        if (!rel || !href) return;
        let el = document.head.querySelector(`link[rel="${rel}"][href="${href}"]`) as HTMLLinkElement | null;
        if (!el) {
          el = document.createElement("link");
          el.setAttribute("rel", rel);
          el.setAttribute("href", href);
          document.head.appendChild(el);
        }
      }
    });
  }, [children]);
  return null;
}

export default Helmet;
