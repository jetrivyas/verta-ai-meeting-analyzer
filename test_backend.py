#!/usr/bin/env python3
"""
Test script for VERTA backend
"""

import requests
import json
import os

def test_backend():
    """Test all backend endpoints"""
    
    # Test URLs
    base_url = "https://verta-ai.onrender.com"
    local_url = "http://localhost:5000"
    
    # Try remote first, then local
    for url in [base_url, local_url]:
        print(f"\n🔍 Testing backend at: {url}")
        
        try:
            # Test health endpoint
            print("Testing /health...")
            response = requests.get(f"{url}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Health check passed")
                print(f"Response: {response.json()}")
            else:
                print(f"❌ Health check failed: {response.status_code}")
                continue
            
            # Test root endpoint
            print("Testing /...")
            response = requests.get(f"{url}/", timeout=10)
            if response.status_code == 200:
                print("✅ Root endpoint passed")
            else:
                print(f"❌ Root endpoint failed: {response.status_code}")
            
            # Test analyze endpoint with OPTIONS (CORS preflight)
            print("Testing /analyze OPTIONS...")
            response = requests.options(f"{url}/analyze", timeout=10)
            if response.status_code == 200:
                print("✅ CORS preflight passed")
            else:
                print(f"❌ CORS preflight failed: {response.status_code}")
            
            print(f"✅ Backend at {url} is working!")
            return url
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection failed: {e}")
            continue
    
    print("❌ No working backend found")
    return None

if __name__ == "__main__":
    print("🔮 VERTA Backend Test")
    print("=" * 40)
    
    working_url = test_backend()
    
    if working_url:
        print(f"\n🎉 Success! Backend is working at: {working_url}")
        print("\n📋 Next steps:")
        print("1. Open your frontend in a browser")
        print("2. Upload a meeting file")
        print("3. Click 'Analyze with AI'")
        print("4. Check browser console for logs")
    else:
        print("\n❌ Backend is not responding")
        print("\n🔧 Troubleshooting:")
        print("1. Check if backend is deployed on Render")
        print("2. Verify render.yaml configuration")
        print("3. Check Render service logs")
        print("4. Try running locally: python backend.py")