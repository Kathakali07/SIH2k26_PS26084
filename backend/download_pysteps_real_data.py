import urllib.request
import zipfile
import os
import numpy as np

# Download a small real sample dataset from PySTEPS (MeteoSwiss/FMI radar data)
url = "https://github.com/pySTEPS/pysteps-data/archive/refs/heads/master.zip"
zip_path = "pysteps_data.zip"
extract_path = "real_radar_data"

if not os.path.exists(extract_path):
    print("Downloading real radar data samples from PySTEPS community...")
    urllib.request.urlretrieve(url, zip_path)
    
    print("Extracting data...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)
    print("Extraction complete!")
else:
    print("Data already downloaded.")

print("\nReal world radar data is now available in your project directory at:")
print(f"{os.path.abspath(extract_path)}\\pysteps-data-master\\radar")
print("\nThis includes real storm events from:")
print("- FMI (Finland)")
print("- MCH (MeteoSwiss, Switzerland)")
print("- BOM (Australia)")
