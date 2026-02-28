import os
import yaml
from scholarly import scholarly

def fetch_publications():
    # Load config file
    config_path = '_config.yml'
    
    if not os.path.exists(config_path):
        print("Config file not found.")
        return

    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)

    scholar_id = config.get('scholar_userid')
    if not scholar_id:
        print("No scholar_userid found in _config.yml")
        return

    print(f"Fetching publications for Scholar ID: {scholar_id}")

    try:
        author = scholarly.search_author_id(scholar_id)
        scholarly.fill(author, sections=['publications'])
    except Exception as e:
        print(f"Failed to fetch data from Scholar: {e}")
        return

    bib_content = ""
    for pub in author.get('publications', []):
        try:
            scholarly.fill(pub)
            bib_content += pub.get('bibtex', '') + "\n\n"
            print(f"Fetched: {pub.get('bib').get('title', 'Unknown')}")
        except Exception as e:
            print(f"Could not fetch full details for a publication: {e}")

    if not bib_content.strip():
        print("No bibtex content found.")
        return

    os.makedirs('_bibliography', exist_ok=True)
    with open('_bibliography/papers.bib', 'w', encoding='utf-8') as f:
        f.write(bib_content)
        
    print("Successfully updated _bibliography/papers.bib")

if __name__ == '__main__':
    fetch_publications()
