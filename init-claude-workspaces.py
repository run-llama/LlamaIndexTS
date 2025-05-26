#!/usr/bin/env python3

"""
Script to create CLAUDE.md files for all pnpm workspace packages.
Parses pnpm-workspace.yaml and finds all directories with package.json files.
Usage: 
  python init-claude-workspaces.py                    # Process all packages
  python init-claude-workspaces.py <directory>        # Process specific directory
"""

import os
import subprocess
import sys
import yaml
import glob
from pathlib import Path
import argparse


def load_workspace_config():
    """Load and parse pnpm-workspace.yaml"""
    workspace_file = Path("pnpm-workspace.yaml")
    if not workspace_file.exists():
        print("❌ Error: pnpm-workspace.yaml not found")
        sys.exit(1)
    
    with open(workspace_file, 'r') as f:
        config = yaml.safe_load(f)
    
    return config.get('packages', [])


def expand_glob_patterns(patterns):
    """Expand glob patterns to actual directories"""
    directories = set()
    
    for pattern in patterns:
        # Remove quotes if present
        pattern = pattern.strip('"\'')
        
        # Handle different glob patterns
        if pattern.endswith('/**'):
            # Recursive pattern like "examples/**"
            base_pattern = pattern[:-3]  # Remove /**
            if os.path.exists(base_pattern):
                for root, dirs, files in os.walk(base_pattern):
                    if 'package.json' in files:
                        directories.add(root)
        elif pattern.endswith('/*'):
            # Single level wildcard like "apps/*"
            matches = glob.glob(pattern)
            for match in matches:
                if os.path.isdir(match) and os.path.exists(os.path.join(match, 'package.json')):
                    directories.add(match)
        else:
            # Direct directory like "unit" or "e2e"
            if os.path.isdir(pattern) and os.path.exists(os.path.join(pattern, 'package.json')):
                directories.add(pattern)
    
    return sorted(directories)


def check_dependencies():
    """Check if required tools are available"""
    try:
        subprocess.run(['claude', '--version'], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: claude CLI is not installed or not in PATH")
        print("   Install it from: https://claude.ai/code")
        sys.exit(1)


def run_claude_init(directory):
    """Run claude command to create CLAUDE.md in the specified directory"""
    claude_md_path = os.path.join(directory, 'CLAUDE.md')
    
    # Check if CLAUDE.md already exists
    if os.path.exists(claude_md_path):
        print(f"⏭️  Skipping {directory} - CLAUDE.md already exists")
        return True
    
    print(f"📦 Creating CLAUDE.md in: {directory}")
    
    try:
        # Change to directory and run claude with specific prompt
        result = subprocess.run([
            'claude', '-p', 
            'Create a CLAUDE.md file in this directory. If needed, you can read CLAUDE.md files from parent directories. The goal is to capture how this package works and detail that in the CLAUDE.md file',
            '--allowedTools', 'Edit,Read,Write'
        ], cwd=directory, capture_output=True, text=True, check=False)
        
        if result.returncode == 0:
            print(f"✅ Successfully created CLAUDE.md in {directory}")
            return True
        else:
            print(f"⚠️  Warning: Failed to create CLAUDE.md in {directory}")
            if result.stderr:
                print(f"   Error: {result.stderr.strip()}")
            return False
                
    except Exception as e:
        print(f"❌ Error running claude command in {directory}: {e}")
        return False


def main():
    """Main function"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Create CLAUDE.md files for workspace packages")
    parser.add_argument('directory', nargs='?', help='Specific directory to process (optional)')
    args = parser.parse_args()
    
    # Check dependencies
    check_dependencies()
    
    # Load workspace configuration
    patterns = load_workspace_config()
    print(f"🔍 Found {len(patterns)} workspace patterns")
    
    # Expand patterns to actual directories
    all_directories = expand_glob_patterns(patterns)
    
    # Filter directories if a specific directory was provided
    if args.directory:
        target_dir = args.directory
        print(f"🤖 Creating CLAUDE.md files for workspace packages under: {target_dir}")
        
        # Validate directory exists
        if not os.path.isdir(target_dir):
            print(f"❌ Error: Directory '{target_dir}' does not exist")
            sys.exit(1)
        
        # Filter to only directories under the target directory
        directories = []
        for workspace_dir in all_directories:
            if workspace_dir == target_dir or workspace_dir.startswith(target_dir + os.sep):
                directories.append(workspace_dir)
    else:
        print("🤖 Creating CLAUDE.md files for all workspace packages...")
        directories = all_directories
    
    print(f"📂 Found {len(directories)} package directories")
    
    if not directories:
        print("⚠️  No package directories found")
        sys.exit(0)
    
    # Show directories that will be processed
    print("\nDirectories to process:")
    for directory in directories:
        print(f"  - {directory}")
    
    print(f"\n➡️  Proceeding to create CLAUDE.md files in {len(directories)} directories...")
    print("\n🚀 Starting CLAUDE.md creation...")
    
    # Process each directory
    success_count = 0
    for directory in directories:
        try:
            if run_claude_init(directory):
                success_count += 1
        except KeyboardInterrupt:
            print("\n⚠️  Interrupted by user")
            break
    
    print(f"\n✅ Completed! Successfully created CLAUDE.md in {success_count}/{len(directories)} packages")
    print("💡 You can now run the claude command individually in any package directory if needed.")


if __name__ == "__main__":
    main()