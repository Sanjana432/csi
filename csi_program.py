import os
import sqlite3
import argparse
import sys
import time
from collections import defaultdict

DB_PATH = os.path.expanduser("~/.dirjump.db")  # Path to the SQLite database

# Function to create a connection to the SQLite database
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

# Function to create the necessary tables
def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS directories (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            score INTEGER DEFAULT 0,
            last_accessed INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

# Function to update directory score (frequency + recency)
def update_directory_score(path):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    current_time = int(time.time())
    
    cursor.execute('''
        SELECT * FROM directories WHERE path = ?
    ''', (path,))
    row = cursor.fetchone()

    if row:
        cursor.execute('''
            UPDATE directories 
            SET score = score + 1, last_accessed = ?
            WHERE path = ?
        ''', (current_time, path))
    else:
        cursor.execute('''
            INSERT INTO directories (path, score, last_accessed) 
            VALUES (?, ?, ?)
        ''', (path, 1, current_time))

    conn.commit()
    conn.close()

# Function to jump to the most frequently visited directory
def jump():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT path FROM directories ORDER BY score DESC, last_accessed DESC LIMIT 1
    ''')
    row = cursor.fetchone()

    if row:
        target_path = row[0]
        print(f"Jumping to: {target_path}")
        os.chdir(target_path)
    else:
        print("No directories in history.")
    conn.close()

# Function to list the directories stored in the database
def list_directories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM directories ORDER BY score DESC, last_accessed DESC
    ''')
    rows = cursor.fetchall()

    if rows:
        for row in rows:
            print(f"Path: {row[1]}, Score: {row[2]}, Last Accessed: {time.ctime(row[3])}")
    else:
        print("No directories in history.")
    conn.close()

# Function to handle the 'cd' functionality (navigate to directory)
def navigate_to_directory(path):
    if os.path.isdir(path):
        os.chdir(path)
        update_directory_score(path)
        print(f"Changed directory to {path}")
    else:
        print(f"Invalid directory: {path}")

# Function to handle the 'jump' functionality (jump to directory)
def jump_directory(path=None):
    if path:
        navigate_to_directory(path)
    else:
        jump()

# Function to add a custom directory
def add_directory(path):
    if os.path.isdir(path):
        update_directory_score(path)
        print(f"Added {path} to jump history.")
    else:
        print(f"Invalid directory: {path}")

# Main function to parse CLI commands
def main():
    create_tables()
    
    parser = argparse.ArgumentParser(description="Directory Jump CLI Tool")
    subparsers = parser.add_subparsers(dest="command")

    # 'jump' command
    subparsers.add_parser('jump', help="Jump to the most frequent directory")

    # 'list' command
    subparsers.add_parser('list', help="List all visited directories")

    # 'add' command
    add_parser = subparsers.add_parser('add', help="Add a directory to the history")
    add_parser.add_argument('path', help="The directory path to add")

    # 'cd' command
    cd_parser = subparsers.add_parser('cd', help="Change directory to a specific path")
    cd_parser.add_argument('path', help="The directory path to navigate to")

    args = parser.parse_args()

    if args.command == 'jump':
        jump()
    elif args.command == 'list':
        list_directories()
    elif args.command == 'add':
        add_directory(args.path)
    elif args.command == 'cd':
        navigate_to_directory(args.path)

if __name__ == "__main__":
    main()
