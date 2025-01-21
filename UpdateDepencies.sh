#!/bin/sh

# Function to update dependencies in a package
update_dependencies() {
    local package_path="$1"
    echo "Updating dependencies for package: $package_path"

    # Navigate to the package directory
    cd "$package_path" || return

    # Update dependencies
    npm outdated --json | jq -r 'to_entries | .[] | "\(.key)@\(.value.current) -> \(.value.latest)"' | while read -r line; do
        dep=$(echo "$line" | cut -d' ' -f1)
        latest_version=$(echo "$line" | cut -d' ' -f3)
        echo "Updating $dep from $(npm list "$dep" --depth=0 | grep "$dep" | awk -F'@' '{print $2}') to $latest_version"
        npm install "$dep@$latest_version"
    done

    # Install updated dependencies
    npm install

    # Go back to the packages directory
    cd ..
}

# Navigate to the packages directory
cd packages || exit

# Loop through each package directory
for package in */; do
    package_path="${package%/}"  # Remove trailing slash
    update_dependencies "$package_path"
done

# Update dependencies in the root directory
echo "Updating dependencies for the root directory"
npm outdated --json | jq -r 'to_entries | .[] | "\(.key)@\(.value.current) -> \(.value.latest)"' | while read -r line; do
    dep=$(echo "$line" | cut -d' ' -f1)
    latest_version=$(echo "$line" | cut -d' ' -f3)
    echo "Updating $dep from $(npm list "$dep" --depth=0 | grep "$dep" | awk -F'@' '{print $2}') to $latest_version"
    npm install "$dep@$latest_version"
done

# Install updated dependencies in the root directory
npm install

# Run commands to ensure everything works
echo "Running format, lint, build, and test commands..."
npm run format -- --fix
npm run lint
npm run build
npm run test

echo "All packages updated and checks completed successfully."