import os
from llama_index.readers.web import WholeSiteReader


def get_documents():
    # Initialize the scraper with a prefix URL and maximum depth
    scraper = WholeSiteReader(
        prefix=os.environ.get("URL_PREFIX"), max_depth=int(os.environ.get("MAX_DEPTH"))
    )
    # Start scraping from a base URL
    documents = scraper.load_data(base_url=os.environ.get("BASE_URL"))

    return documents
