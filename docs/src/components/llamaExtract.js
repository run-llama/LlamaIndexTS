export const LEPython = ({ children }) => (
  <>
    <span>
      <small>In Python:</small>
    </span>
    <pre>
      extractor = LlamaExtract(
      <br />
      &nbsp;&nbsp;{children}
      <br />)
    </pre>
  </>
);

export const LEAPI = ({
  children,
  endpoint = "",
  isUpload = false,
  outputFile = false,
}) => {
  if (!endpoint) endpoint = "parsing/upload";
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
  if (typeof children == "string") {
    let entries = children.split("|");
    paramList = entries.map((line) => {
      return (
        <>
          &nbsp;\
          <br />
          &nbsp;&nbsp;--form '{line}'
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
        &nbsp;&nbsp;'https://api.cloud.llamaindex.ai/api/{endpoint}' &nbsp;\
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
