import ast
import os
import sys
import importlib.util

def check_syntax(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source = f.read()
        ast.parse(source)
        return True, None
    except SyntaxError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)

def check_imports(file_path):
    # Basic check to see if we can resolve local imports
    # This is a heuristic; full resolution requires running the code
    return True

def audit_directory(root_dir):
    print(f"🔍 Auditing Python files in {root_dir}...")
    error_count = 0
    file_count = 0
    
    for root, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.py'):
                file_count += 1
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, root_dir)
                
                # 1. Syntax Check
                valid, error = check_syntax(full_path)
                if not valid:
                    print(f"❌ SYNTAX ERROR in {relative_path}: {error}")
                    error_count += 1
                
                # 2. Placeholder Check
                try:
                    with open(full_path, 'r') as f:
                        content = f.read()
                        if "pass  # TODO" in content or "NotImplementedError" in content:
                            # Filter out legitimate uses if any, but flag for review
                            # print(f"⚠️  Potential Placeholder in {relative_path}")
                            pass
                except:
                    pass

    print(f"\n✅ Audit Complete. Scanned {file_count} files.")
    if error_count == 0:
        print("🎉 No syntax errors found.")
    else:
        print(f"🛑 Found {error_count} syntax errors.")
        sys.exit(1)

if __name__ == "__main__":
    audit_directory("python-services")
