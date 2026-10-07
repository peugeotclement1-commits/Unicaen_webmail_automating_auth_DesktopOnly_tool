from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import requests
import pathlib
from cas import login, access_second_auth, access_third_auth

# Start a session
session = requests.Session()

driver = webdriver.Chrome()


# URL for the initial login (using reqres.in mock service)
login_url = "https://ecampus.unicaen.fr/"

driver.get(login_url)

def access_year():
    lien_access_year = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Ecampus 2025-2026 et 2026-2027"))
    )
    lien_access_year.click()

    
    global login_url
    login_url= driver.current_url


def access_cas():
    lien_access_cas = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "CAS - Compte Numérique Unicaen"))
    )
    lien_access_cas.click()

    global login_url
    login_url = driver.current_url


def main() -> None:

    driver.get(login_url)

    access_year()

    access_cas()

    login(login_url)

    
    access_second_auth()

    

    access_third_auth()


if __name__ == "__main__":
	main()