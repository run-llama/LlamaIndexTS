import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import { Children, cloneElement } from "react";

export const StyledTitle = ({ title, subtitle }) => {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <h3 style={{ marginBottom: "0.25rem" }}>{title}</h3>
      {subtitle && (
        <span style={{ fontSize: "0.875rem", opacity: 0.6 }}>{subtitle}</span>
      )}
    </div>
  );
};
export const StyledTab = ({ children }) => {
  return (
    <Tabs>
      {Children.map(children, (child) => {
        if (child.type !== TabItem) return child;

        return cloneElement(child, {
          children: (
            <div style={{ fontSize: "0.875rem" }}>{child.props.children}</div>
          ),
        });
      })}
    </Tabs>
  );
};

export const ImageSizer = ({ children, width = "350px" }) => {
  return <div style={{ width, margin: "0" }}>{children}</div>;
};
