#!/bin/bash

# Firebase Setup Script for JustdialOCR React Native SDK
# This script helps automate Firebase project setup

set -e

echo "🔥 JustdialOCR Firebase Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    print_status "Checking Firebase CLI installation..."
    
    if ! command -v firebase &> /dev/null; then
        print_error "Firebase CLI is not installed"
        echo "Install it with: npm install -g firebase-tools"
        exit 1
    fi
    
    print_success "Firebase CLI is installed"
}

# Check if user is logged in to Firebase
check_firebase_auth() {
    print_status "Checking Firebase authentication..."
    
    if ! firebase projects:list &> /dev/null; then
        print_error "Not logged in to Firebase"
        echo "Please run: firebase login"
        exit 1
    fi
    
    print_success "Firebase authentication OK"
}

# Create Firebase project
create_firebase_project() {
    print_status "Firebase project creation..."
    
    read -p "Enter your Firebase project ID (e.g., justdial-ocr-prod): " project_id
    
    if [ -z "$project_id" ]; then
        print_error "Project ID cannot be empty"
        exit 1
    fi
    
    read -p "Enter project display name (e.g., JustdialOCR Production): " display_name
    
    if [ -z "$display_name" ]; then
        display_name="JustdialOCR"
    fi
    
    print_status "Creating Firebase project: $project_id"
    
    # Note: Firebase CLI doesn't support automatic project creation with region
    # User must create project manually in console with asia-south1 region
    
    print_warning "Please create the Firebase project manually:"
    echo "1. Go to https://console.firebase.google.com/"
    echo "2. Create project with ID: $project_id"
    echo "3. Set region to: asia-south1 (Mumbai) - REQUIRED FOR COMPLIANCE"
    echo "4. Enable Authentication and Vertex AI"
    echo ""
    read -p "Press Enter after creating the project manually..."
    
    # Set the project for Firebase CLI
    firebase use "$project_id"
    print_success "Firebase project configured: $project_id"
}

# Configure Firebase features
configure_firebase_features() {
    print_status "Configuring Firebase features..."
    
    # Initialize Firebase in current directory
    print_status "Initializing Firebase configuration..."
    firebase init --project="$1" <<EOF
N
Y
auth
functions
N
N
JavaScript
N
N
N
Y
N
EOF
    
    print_success "Firebase features configured"
}

# Setup Android configuration
setup_android_config() {
    print_status "Setting up Android configuration..."
    
    read -p "Enter Android package name (default: com.justdialocrsdk.example): " android_package
    if [ -z "$android_package" ]; then
        android_package="com.justdialocrsdk.example"
    fi
    
    read -p "Enter Android SHA-1 fingerprint (get from: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey): " sha1
    
    if [ -z "$sha1" ]; then
        print_warning "SHA-1 fingerprint not provided. You'll need to add it manually in Firebase Console."
    fi
    
    print_status "Android app configuration:"
    echo "Package: $android_package"
    echo "SHA-1: $sha1"
    echo ""
    print_warning "Please add Android app manually in Firebase Console:"
    echo "1. Go to Project Overview > Add app > Android"
    echo "2. Package name: $android_package"
    echo "3. SHA-1: $sha1"
    echo "4. Download google-services.json to example/android/app/"
    echo ""
    read -p "Press Enter after adding Android app..."
    
    # Check if google-services.json exists
    if [ -f "example/android/app/google-services.json" ]; then
        print_success "google-services.json found"
    else
        print_error "google-services.json not found in example/android/app/"
        echo "Please download it from Firebase Console"
    fi
}

# Setup iOS configuration  
setup_ios_config() {
    print_status "Setting up iOS configuration..."
    
    read -p "Enter iOS bundle ID (default: com.justdialocrsdk.example): " ios_bundle
    if [ -z "$ios_bundle" ]; then
        ios_bundle="com.justdialocrsdk.example"
    fi
    
    print_status "iOS app configuration:"
    echo "Bundle ID: $ios_bundle"
    echo ""
    print_warning "Please add iOS app manually in Firebase Console:"
    echo "1. Go to Project Overview > Add app > iOS"
    echo "2. Bundle ID: $ios_bundle"
    echo "3. Download GoogleService-Info.plist"
    echo "4. Add to Xcode project and example/ios/ directory"
    echo ""
    read -p "Press Enter after adding iOS app..."
    
    # Check if GoogleService-Info.plist exists
    if [ -f "example/ios/GoogleService-Info.plist" ]; then
        print_success "GoogleService-Info.plist found"
    else
        print_error "GoogleService-Info.plist not found in example/ios/"
        echo "Please download it from Firebase Console"
    fi
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    echo "Please enable these APIs in Google Cloud Console:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Select project: $1"
    echo "3. Go to APIs & Services > Library"
    echo "4. Enable these APIs:"
    echo "   - Vertex AI API"
    echo "   - Generative Language API" 
    echo "   - Firebase Management API"
    echo "   - Firebase Rules API"
    echo ""
    read -p "Press Enter after enabling APIs..."
    
    print_success "APIs configuration completed"
}

# Setup authentication
setup_authentication() {
    print_status "Setting up Firebase Authentication..."
    
    echo "Please configure Authentication in Firebase Console:"
    echo "1. Go to Firebase Console > Authentication"
    echo "2. Click 'Get started'"
    echo "3. Go to Sign-in method tab"
    echo "4. Enable 'Anonymous' provider"
    echo "5. Enable 'Google' provider (recommended for production)"
    echo ""
    read -p "Press Enter after configuring authentication..."
    
    print_success "Authentication setup completed"
}

# Verify setup
verify_setup() {
    print_status "Verifying Firebase setup..."
    
    local errors=0
    
    # Check Android config
    if [ ! -f "example/android/app/google-services.json" ]; then
        print_error "Missing: example/android/app/google-services.json"
        errors=$((errors + 1))
    else
        print_success "Found: google-services.json"
    fi
    
    # Check iOS config
    if [ ! -f "example/ios/GoogleService-Info.plist" ]; then
        print_error "Missing: example/ios/GoogleService-Info.plist" 
        errors=$((errors + 1))
    else
        print_success "Found: GoogleService-Info.plist"
    fi
    
    # Check if Firebase is configured
    if [ ! -f "firebase.json" ]; then
        print_warning "firebase.json not found (optional)"
    else
        print_success "Found: firebase.json"
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "✅ Firebase setup verification passed!"
        echo ""
        echo "Next steps:"
        echo "1. Run: cd example && yarn install"
        echo "2. For iOS: cd ios && pod install"  
        echo "3. Run: yarn ios or yarn android"
        echo ""
        print_success "🚀 Setup completed! Ready to test JustdialOCR SDK"
    else
        print_error "❌ Setup verification failed. $errors errors found."
        echo "Please fix the errors above and run verification again."
        exit 1
    fi
}

# Main setup flow
main() {
    echo ""
    print_status "Starting Firebase setup for JustdialOCR SDK..."
    echo ""
    
    # Pre-flight checks
    check_firebase_cli
    check_firebase_auth
    
    # Get or create project
    echo ""
    read -p "Do you want to create a new Firebase project? (y/n): " create_new
    
    if [[ $create_new == "y" || $create_new == "Y" ]]; then
        create_firebase_project
        project_id=$(firebase use --project)
    else
        read -p "Enter existing Firebase project ID: " project_id
        firebase use "$project_id"
        print_success "Using existing project: $project_id"
    fi
    
    # Configure Firebase features
    read -p "Initialize Firebase configuration? (y/n): " init_firebase
    if [[ $init_firebase == "y" || $init_firebase == "Y" ]]; then
        configure_firebase_features "$project_id"
    fi
    
    # Setup mobile apps
    echo ""
    setup_android_config
    setup_ios_config
    
    # Enable APIs and auth
    echo ""
    enable_apis "$project_id"
    setup_authentication
    
    # Verify setup
    echo ""
    verify_setup
}

# Run main function
main "$@"