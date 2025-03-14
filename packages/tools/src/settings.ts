class GlobalToolSettings {
  private _outputDir: string = "output/tools";
  private _fileServerURLPrefix: string | undefined;

  set outputDir(outputDir: string) {
    this._outputDir = outputDir;
  }

  get outputDir() {
    return this._outputDir;
  }

  set fileServerURLPrefix(fileServerURLPrefix: string | undefined) {
    this._fileServerURLPrefix = fileServerURLPrefix;
  }

  get fileServerURLPrefix() {
    return this._fileServerURLPrefix;
  }
}

export const ToolSettings = new GlobalToolSettings();
