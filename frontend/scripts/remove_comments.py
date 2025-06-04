import os
import re
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Regex patterns for different file types
COMMENT_PATTERNS = {
    '.html': re.compile(r'<!--.*?-->', re.DOTALL),
    '.ts': re.compile(r'//.*?$|/\*.*?\*/|<!--.*?-->', re.DOTALL | re.MULTILINE),
    '.css': re.compile(r'/\*.*?\*/', re.DOTALL)
}

def remove_comments(content, file_extension):
    """Remove comments based on file extension"""
    if file_extension in COMMENT_PATTERNS:
        return COMMENT_PATTERNS[file_extension].sub('', content)
    return content

def process_file(file_path):
    """Process a single file to remove comments"""
    try:
        file_extension = file_path.suffix
        if file_extension not in COMMENT_PATTERNS:
            return
        
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        new_content = remove_comments(content, file_extension)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            logging.info(f"Processed: {file_path}")
    except Exception as e:
        logging.error(f"Error processing {file_path}: {str(e)}")

def main():
    project_root = Path(__file__).parent.parent
    src_dir = project_root / 'src'
    
    if not src_dir.exists():
        logging.error(f"Source directory not found: {src_dir}")
        return
    
    # Process all relevant files in src directory
    for ext in COMMENT_PATTERNS.keys():
        for file_path in src_dir.rglob(f'*{ext}'):
            process_file(file_path)
    
    logging.info("Comment removal process completed.")

if __name__ == '__main__':
    main() 