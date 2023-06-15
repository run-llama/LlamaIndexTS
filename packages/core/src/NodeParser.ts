interface NodeParser {}

class SimpleNodeParser implements NodeParser {
  constructor(
    textSplitter: any = null,
    includeExtraInfo: boolean = true,
    includePrevNextRel: boolean = true
  ) {}

  static fromDefaults(): SimpleNodeParser {
    return new SimpleNodeParser();
  }
}
