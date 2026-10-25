from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import json

def scrape_google_maps_reviews(url, max_scrolls=5):
    # Konfigurasi WebDriver
    options = webdriver.ChromeOptions()
    options.add_argument('--lang=id') # Memaksa bahasa ke bahasa Indonesia
    # options.add_argument('--headless') # Hapus komentar baris ini untuk menjalankan tanpa membuka jendela Chrome
    
    driver = webdriver.Chrome(options=options)
    driver.get(url)
    
    # Tunggu hingga halaman selesai dimuat
    time.sleep(5) 
    
    try:
        # Melakukan scrolling ke ulasan terbawah untuk memuat data baru
        for _ in range(max_scrolls):
            # 'jftiEf' adalah class bawaan Google Maps untuk kotak ulasan individual
            reviews_elements = driver.find_elements(By.CLASS_NAME, 'jftiEf')
            if reviews_elements:
                # Scroll ke ulasan paling bawah yang saat ini terlihat
                driver.execute_script("arguments[0].scrollIntoView();", reviews_elements[-1])
            time.sleep(2.5) # Jeda untuk memberi waktu AJAX memuat data baru

        # Mengambil HTML setelah semua scroll selesai
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Ekstraksi data ulasan
        reviews = soup.find_all('div', class_='jftiEf')
        
        hasil = []
        for review in reviews:
            # Ekstrak nama reviewer (class 'd4r55' sering digunakan untuk nama)
            name_elem = review.find('div', class_='d4r55')
            name = name_elem.text.strip() if name_elem else "Anonim"
            
            # Ekstrak teks ulasan (class 'wiI7pd' untuk teks konten)
            text_elem = review.find('span', class_='wiI7pd')
            text = text_elem.text.strip() if text_elem else ""
            
            # Ekstrak rating (tersembunyi dalam atribut aria-label pada class 'kvMYJc')
            rating_elem = review.find('span', class_='kvMYJc')
            rating = rating_elem['aria-label'] if rating_elem and 'aria-label' in rating_elem.attrs else "Tidak ada rating"
            
            # Hanya simpan jika ada teks ulasannya
            if text:
                hasil.append({
                    'nama': name,
                    'rating': rating,
                    'ulasan': text
                })
                
        return hasil

    finally:
        driver.quit()

# ----------------- CARA PENGGUNAAN -----------------
# 1. Buka Google Maps, cari tempatnya, klik tab "Ulasan" (Reviews).
# 2. Salin URL di browser Anda dan tempel di bawah ini.
URL_TARGET = 'MASUKKAN_URL_TAB_ULASAN_GOOGLE_MAPS_DISINI'

if __name__ == '__main__':
    print("Memulai scraping...")
    data_ulasan = scrape_google_maps_reviews(URL_TARGET, max_scrolls=3)
    
    # Simpan hasil ke file JSON
    with open('ulasan_gmaps.json', 'w', encoding='utf-8') as f:
        json.dump(data_ulasan, f, ensure_ascii=False, indent=4)
        
    print(f"Berhasil mengekstrak {len(data_ulasan)} ulasan. Data disimpan di ulasan_gmaps.json")