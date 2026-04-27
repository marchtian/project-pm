import React from 'react';

export function jsx(
  type: React.ElementType,
  props: Record<string, unknown>,
  key?: string,
): React.ReactElement {
  const { children, ...rest } = props;
  if (key !== undefined) (rest as Record<string, unknown>).key = key;
  return children !== undefined
    ? React.createElement(type, rest as React.Attributes, children as React.ReactNode)
    : React.createElement(type, rest as React.Attributes);
}

export function jsxs(
  type: React.ElementType,
  props: Record<string, unknown>,
  key?: string,
): React.ReactElement {
  const { children, ...rest } = props;
  if (key !== undefined) (rest as Record<string, unknown>).key = key;
  if (Array.isArray(children)) {
    return React.createElement(type, rest as React.Attributes, ...children);
  }
  return children !== undefined
    ? React.createElement(type, rest as React.Attributes, children as React.ReactNode)
    : React.createElement(type, rest as React.Attributes);
}

export const jsxDEV = jsx;
export const Fragment = React.Fragment;
