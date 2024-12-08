import os

# Get a list of all installed packages
installed_packages = os.popen('pip freeze').read().splitlines()

# Uninstall each package
for package in installed_packages:
    os.system(f'pip uninstall -y {package}')

print("All packages uninstalled successfully!")
