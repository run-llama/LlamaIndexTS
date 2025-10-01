import React from "react";

export const LPPython = ({ children }) => (
  <>
    <span>
      <small>In Python:</small>
    </span>
    <pre>
      parser = LlamaParse(
      <br />
      &nbsp;&nbsp;{children}
      <br />)
    </pre>
  </>
);

export const LPAPI = ({
  children,
  endpoint = "",
  isUpload = false,
  outputFile = false,
}) => {
  if (!endpoint) endpoint = "upload";
  let outputLine = <></>;
  if (outputFile)
    outputLine = (
      <>
        &nbsp;\
        <br />
        &nbsp;&nbsp;--output "file.png"
      </>
    );
  let uploadLine = <></>;
  if (isUpload)
    uploadLine = (
      <>
        &nbsp;\
        <br />
        &nbsp;&nbsp;-F 'file=@/path/to/your/file.pdf;type=application/pdf'
      </>
    );
  let paramList = <></>;
  if (typeof children !== "undefined") {
    // Get the raw text content of children
    let rawContent = "";
    if (typeof children === "string") {
      rawContent = children;
    } else {
      // For React elements, get their text content
      // this is because React interprets key-value pairs with URLs as prop values
      rawContent = React.Children.toArray(children)
        .map((child) => {
          if (typeof child === "string") return child;
          if (React.isValidElement(child)) return child.props.children || "";
          return "";
        })
        .join("");
    }

    // Split by | if multiple parameters
    const entries = rawContent.split("|");

    paramList = entries.map((line) => {
      return (
        <>
          &nbsp;\
          <br />
          &nbsp;&nbsp;--form '{line.trim()}'
        </>
      );
    });
  }

  return (
    <>
      <span>
        <small>Using the API:</small>
      </span>
      <pre>
        curl -X 'POST' \<br />
        &nbsp;&nbsp;'https://api.cloud.llamaindex.ai/api/v1/parsing/{endpoint}'
        &nbsp;\
        <br />
        &nbsp;&nbsp;-H 'accept: application/json' \<br />
        &nbsp;&nbsp;-H 'Content-Type: multipart/form-data' \<br />
        &nbsp;&nbsp;-H "Authorization: Bearer $LLAMA_CLOUD_API_KEY"
        {paramList}
        {uploadLine}
        {outputLine}
      </pre>
    </>
  );
};
