import os
from bs4 import BeautifulSoup

def get_description_from_html(html_file_path, category):
    """
    Extracts a concise description from an index.html file.
    For slides, it tries to get the text from the first significant heading or paragraph.
    For worksheets, it provides a general description or a summary if possible.
    """
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')

        body_content = soup.find('body')
        if not body_content:
            return "Không có mô tả."

        description = "Không có mô tả."

        # Try to find the first meaningful text element
        for tag_name in ['h1', 'h2', 'h3', 'p', 'div']:
            first_element = body_content.find(tag_name)
            if first_element and first_element.get_text(strip=True):
                # Take the first 200 characters or so, and ensure it ends cleanly.
                text = first_element.get_text(separator=' ', strip=True)
                if len(text) > 200:
                    description = text[:200].rsplit(' ', 1)[0] + '...'
                else:
                    description = text
                break

        if description == "Không có mô tả." and category == "worksheets":
            description = "Bài tập bổ trợ cho học sinh." # More specific default for worksheets

        return description

    except Exception as e:
        print(f"Error extracting description from {html_file_path}: {e}")
        return "Không có mô tả."

def update_lesson_info_file():
    lessons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lessons')

    for category_name in os.listdir(lessons_dir):
        category_path = os.path.join(lessons_dir, category_name)
        if not os.path.isdir(category_path):
            continue

        if category_name not in ['slides', 'worksheets']: # Only process 'slides' and 'worksheets'
            continue

        for lesson_folder_name in os.listdir(category_path):
            lesson_folder_path = os.path.join(category_path, lesson_folder_name)
            if not os.path.isdir(lesson_folder_path):
                continue

            index_html_path = os.path.join(lesson_folder_path, 'index.html')
            info_txt_path = os.path.join(lesson_folder_path, 'info.txt')

            if not os.path.exists(index_html_path):
                print(f"Skipping {lesson_folder_path}: index.html not found.")
                continue
            
            # Extract description from index.html
            new_description = get_description_from_html(index_html_path, category_name)

            # Read existing info.txt content
            title = ""
            author = ""
            if os.path.exists(info_txt_path):
                try:
                    with open(info_txt_path, 'r', encoding='utf-8') as f:
                        info_content = f.read()
                        info_dict = {}
                        for line in info_content.splitlines():
                            if ':' in line:
                                key, value = line.split(':', 1)
                                info_dict[key.strip().lower()] = value.strip()
                        title = info_dict.get('title', '')
                        author = info_dict.get('author', '')
                except Exception as e:
                    print(f"Error reading existing info.txt for {info_txt_path}: {e}")
            
            # If title or author were not found, use a default or derive from folder name
            if not title:
                title = lesson_folder_name.replace('-', ' ').replace('_', ' ').title()
            if not author:
                author = "Gen8" # Default author

            # Prepare new info.txt content
            updated_info_content = f"Title: {title}\nAuthor: {author}\nDescription: {new_description}"
            
            # Check if content has changed before writing
            should_write = False
            if os.path.exists(info_txt_path):
                try:
                    with open(info_txt_path, 'r', encoding='utf-8') as f:
                        current_info_content = f.read().strip()
                    if current_info_content != updated_info_content.strip():
                        should_write = True
                except Exception as e:
                    print(f"Error comparing info.txt at {info_txt_path}: {e}")
                    should_write = True # If error, force write

            else: # If info.txt does not exist, create it
                should_write = True

            if should_write:
                try:
                    with open(info_txt_path, 'w', encoding='utf-8') as f:
                        f.write(updated_info_content)
                    print(f"Updated description in {info_txt_path}")
                except Exception as e:
                    print(f"Error writing to {info_txt_path}: {e}")

if __name__ == "__main__":
    update_lesson_info_file()
    print("Description update process completed.") 